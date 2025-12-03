import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';
import { TicketPack, TicketPackId } from '../entities/ticket-pack';
import { TicketPackRepository } from '../repositories/ticket-pack-repository';
import { TicketPackStatus } from '../enums/ticket-pack-status';


export interface ConsumeTicketCreditInput {
  gymId: GymId;
  userId: UserId;
  ticketPackId: TicketPackId;
}

export class ConsumeTicketCreditError extends Error {
  readonly code:
    | 'TICKET_PACK_NOT_FOUND'
    | 'TICKET_PACK_NOT_IN_GYM'
    | 'TICKET_PACK_NOT_OWNED_BY_USER'
    | 'TICKET_PACK_NOT_ACTIVE'
    | 'TICKET_PACK_EXPIRED'
    | 'NO_REMAINING_CREDITS';

  constructor(code: ConsumeTicketCreditError['code'], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export interface ConsumeTicketCreditDeps {
  ticketPackRepo: TicketPackRepository;
  now: () => Date;
}

export async function consumeTicketCredit(
  deps: ConsumeTicketCreditDeps,
  input: ConsumeTicketCreditInput,
): Promise<TicketPack> {
  const { ticketPackRepo, now } = deps;
  const { gymId, userId, ticketPackId } = input;

  const pack = await ticketPackRepo.findById(ticketPackId);
  if (!pack) {
    throw new ConsumeTicketCreditError(
      'TICKET_PACK_NOT_FOUND',
      'Ticket pack not found',
    );
  }

  if (pack.gymId !== gymId) {
    throw new ConsumeTicketCreditError(
      'TICKET_PACK_NOT_IN_GYM',
      'Ticket pack does not belong to this gym',
    );
  }

  if (pack.userId !== userId) {
    throw new ConsumeTicketCreditError(
      'TICKET_PACK_NOT_OWNED_BY_USER',
      'Ticket pack does not belong to this user',
    );
  }

  if (pack.status !== 'ACTIVE') {
    throw new ConsumeTicketCreditError(
      'TICKET_PACK_NOT_ACTIVE',
      'Ticket pack is not active',
    );
  }

  const nowDate = now();

  if (pack.expiresAt && pack.expiresAt.getTime() < nowDate.getTime()) {
    // marcar como expirada
    const updated: TicketPack = {
      ...pack,
      status: 'EXPIRED',
      updatedAt: nowDate,
    };
    await ticketPackRepo.save(updated);

    throw new ConsumeTicketCreditError(
      'TICKET_PACK_EXPIRED',
      'Ticket pack has expired',
    );
  }

  if (pack.remainingCredits <= 0) {
    throw new ConsumeTicketCreditError(
      'NO_REMAINING_CREDITS',
      'Ticket pack has no remaining credits',
    );
  }

  const updatedRemaining = pack.remainingCredits - 1;

  let newStatus: TicketPackStatus = pack.status;
  if (updatedRemaining === 0) {
    newStatus = 'USED_UP';
  }

  const updatedPack: TicketPack = {
    ...pack,
    remainingCredits: updatedRemaining,
    status: newStatus,
    updatedAt: nowDate,
  };

  const saved = await ticketPackRepo.save(updatedPack);
  return saved;
}
