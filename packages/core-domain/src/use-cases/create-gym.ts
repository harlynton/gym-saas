// packages/core-domain/src/use-cases/create-gym.ts
import { Gym, GymId } from '../entities/gym';
import { GymMember, GymMemberId } from '../entities/gym-member';
import { UserId } from '../entities/user';
import { RoleInGym } from '../enums/roles';
import { GymMemberRepository } from '../repositories/gym-member-repository';
import { GymRepository } from '../repositories/gym-repository';

// Input del caso de uso
export interface CreateGymInput {
  name: string;
  ownerUserId: UserId;
}

// Errores de dominio específicos (dejamos pocos por ahora)
export class CreateGymError extends Error {
  readonly code: 'INVALID_NAME';

  constructor(code: CreateGymError['code'], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

// Dependencias inyectables
export interface CreateGymDeps {
  gymRepo: GymRepository;
  gymMemberRepo: GymMemberRepository;
  generateGymId: () => GymId;
  generateGymMemberId: () => GymMemberId;
  now: () => Date;
}

// Caso de uso
export async function createGym(
  deps: CreateGymDeps,
  input: CreateGymInput,
): Promise<Gym> {
  const { gymRepo, gymMemberRepo, generateGymId, generateGymMemberId, now } = deps;
  const { name, ownerUserId } = input;

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new CreateGymError('INVALID_NAME', 'Gym name cannot be empty');
  }

  // 1. Crear Gym
  const gym: Gym = {
    id: generateGymId(),
    name: trimmedName,
    slug: trimmedName.toLowerCase().replace(/\s+/g, '-'),
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  };

  const savedGym = await gymRepo.save(gym);

  // 2. Vincular al dueño como OWNER del gym
  const gymMember: GymMember = {
    id: generateGymMemberId(),
    gymId: savedGym.id,
    userId: ownerUserId,
    role: 'OWNER' as RoleInGym,
    isActive: true,
    joinedAt: now(),
  };

  await gymMemberRepo.save(gymMember);

  return savedGym;
}
