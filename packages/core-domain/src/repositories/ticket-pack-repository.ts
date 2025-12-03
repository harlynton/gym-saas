import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';
import { TicketPack, TicketPackId } from '../entities/ticket-pack';

export interface TicketPackRepository {
  findById(id: TicketPackId): Promise<TicketPack | null>;

  findActiveByUserAndGym(userId: UserId, gymId: GymId): Promise<TicketPack[]>;

  save(ticketPack: TicketPack): Promise<TicketPack>;
}
