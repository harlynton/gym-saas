import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';
import { TicketPack, TicketPackId } from '../entities/ticket-pack';
import { Money } from '../value-objects/money';
import { TicketPackRepository } from '../repositories/ticket-pack-repository';
import { GymMemberRepository } from '../repositories/gym-member-repository';

export interface CreateTicketPackInput {
  gymId: GymId;
  userId: UserId;
  name: string;              // "10 clases spinning"
  totalCredits: number;      // ej: 10
  price: Money;              // monto cobrado
  startDate?: Date;         // fecha desde la cual contar validez
  expiresAt?: Date | null;   // fecha de vencimiento concreta
  validDays?: number;        // alternativa: "30 días desde hoy"
}

export class CreateTicketPackError extends Error {
  readonly code:
    | 'USER_NOT_MEMBER_OF_GYM'
    | 'USER_NOT_ACTIVE_MEMBER'
    | 'INVALID_TOTAL_CREDITS';

  constructor(code: CreateTicketPackError['code'], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export interface CreateTicketPackDeps {
  ticketPackRepo: TicketPackRepository;
  gymMemberRepo: GymMemberRepository;
  generateId: () => TicketPackId;
  now: () => Date;
}

export async function createTicketPack(
  deps: CreateTicketPackDeps,
  input: CreateTicketPackInput,
): Promise<TicketPack> {
  const { ticketPackRepo, gymMemberRepo, generateId, now } = deps;
  const { gymId, userId, name, totalCredits, price } = input;

  if (totalCredits <= 0) {
    throw new CreateTicketPackError(
      'INVALID_TOTAL_CREDITS',
      'Ticket pack must have at least 1 credit',
    );
  }

  // 1. Validar que el usuario pertenezca al gym
  const member = await gymMemberRepo.findByUserAndGym(userId, gymId);
  if (!member) {
    throw new CreateTicketPackError(
      'USER_NOT_MEMBER_OF_GYM',
      'User is not a member of this gym',
    );
  }

  if (!member.isActive) {
    throw new CreateTicketPackError(
      'USER_NOT_ACTIVE_MEMBER',
      'User is not an active member of this gym',
    );
  }

  // 2. Calcular fecha de expiración (si aplica)
  let expiresAt: Date | null = input.expiresAt ?? null;
  if (!expiresAt && input.validDays && input.validDays > 0) {
    const start = input.startDate ?? now();
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + input.validDays);
    expiresAt = end;
  }

  // 3. Crear la entidad
  const createdAt = now();
  const pack: TicketPack = {
    id: generateId(),
    gymId,
    userId,
    name,
    totalCredits,
    remainingCredits: totalCredits,
    expiresAt,
    price,
    status: 'ACTIVE',
    createdAt,
    updatedAt: createdAt,
  };

  // 4. Guardar
  const saved = await ticketPackRepo.save(pack);
  return saved;
}
