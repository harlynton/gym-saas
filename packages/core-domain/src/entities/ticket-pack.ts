import { GymId } from './gym';
import { UserId } from './user';
import { TicketPackStatus } from '../enums/ticket-pack-status';
import { Money } from '../value-objects/money';

export type TicketPackId = string;

export interface TicketPack {
  id: TicketPackId;
  gymId: GymId;
  userId: UserId;
  name: string;               // "10 clases spinning", etc.
  totalCredits: number;
  remainingCredits: number;
  expiresAt: Date | null;
  price: Money;
  status: TicketPackStatus;
  createdAt: Date;
  updatedAt: Date;
}
