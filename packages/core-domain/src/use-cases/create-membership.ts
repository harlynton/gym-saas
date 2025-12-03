import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';
import { Membership, MembershipId } from '../entities/membership';
import { MembershipPlanId } from '../entities/membership-plan';
import { MembershipStatus } from '../enums/membership-status';
import { DateRange } from '../value-objects/date-range';
import { MembershipPlanRepository } from '../repositories/membership-plan-repository';
import { MembershipRepository } from '../repositories/membership-repository';
import { GymMemberRepository } from '../repositories/gym-member-repository';

// Input DTO del caso de uso
export interface CreateMembershipInput {
  gymId: GymId;
  userId: UserId;
  membershipPlanId: MembershipPlanId;
  startDate?: Date; // si no se manda, hoy
}

// Errores específicos del dominio
export class CreateMembershipError extends Error {
  readonly code:
    | 'PLAN_NOT_FOUND'
    | 'PLAN_NOT_IN_GYM'
    | 'USER_NOT_MEMBER_OF_GYM'
    | 'ACTIVE_MEMBERSHIP_EXISTS';

  constructor(code: CreateMembershipError['code'], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

// Dependencias que el caso de uso necesita
export interface CreateMembershipDeps {
  membershipPlanRepo: MembershipPlanRepository;
  membershipRepo: MembershipRepository;
  gymMemberRepo: GymMemberRepository;
  // generador de ids (puede ser uuid)
  generateId: () => MembershipId;
  now: () => Date;
}

// Función de caso de uso
export async function createMembership(
  deps: CreateMembershipDeps,
  input: CreateMembershipInput,
): Promise<Membership> {
  const { membershipPlanRepo, membershipRepo, gymMemberRepo, generateId, now } = deps;
  const { gymId, userId, membershipPlanId } = input;

  // 1. Validar que exista el plan
  const plan = await membershipPlanRepo.findById(membershipPlanId);
  if (!plan) {
    throw new CreateMembershipError('PLAN_NOT_FOUND', 'Membership plan not found');
  }

  // 2. Validar que el plan pertenece al mismo gym
  if (plan.gymId !== gymId) {
    throw new CreateMembershipError('PLAN_NOT_IN_GYM', 'Plan does not belong to this gym');
  }

  // 3. Validar que el usuario es miembro del gym
  const gymMember = await gymMemberRepo.findByUserAndGym(userId, gymId);
  if (!gymMember || !gymMember.isActive) {
    throw new CreateMembershipError('USER_NOT_MEMBER_OF_GYM', 'User is not an active member of this gym');
  }

  // 4. Validar que no tenga otra membresía activa
  const existing = await membershipRepo.findActiveByUserAndGym(userId, gymId);
  if (existing) {
    throw new CreateMembershipError(
      'ACTIVE_MEMBERSHIP_EXISTS',
      'User already has an active membership in this gym',
    );
  }

  // 5. Construir periodo
  const start = input.startDate ?? now();
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + plan.durationDays);

  const period: DateRange = {
    startDate: start,
    endDate: end,
  };

  // 6. Crear entidad de dominio
  const membership: Membership = {
    id: generateId(),
    gymId,
    userId,
    membershipPlanId,
    period,
    status: 'ACTIVE' satisfies MembershipStatus,
    createdAt: now(),
    updatedAt: now(),
  };

  // 7. Persistir
  const saved = await membershipRepo.save(membership);
  return saved;
}
