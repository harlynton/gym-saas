import { GymId } from './gym';
import { UserId } from './user';
import { PaymentStatus } from '../enums/payment-status';
import { Money } from '../value-objects/money';

export type PaymentId = string;

export interface Payment {
  id: PaymentId;
  gymId: GymId;
  userId: UserId | null;  // podría existir pago de alguien aún no registrado
  amount: Money;
  status: PaymentStatus;
  method: string;         // "CARD", "CASH", "PSE", etc.
  description?: string;   // "Membresía mensual", "Tiquetera 10 clases", etc.
  provider: string;       // "WOMPI", "MERCADOPAGO", "MANUAL"
  providerRef?: string;   // id de transacción en la pasarela
  createdAt: Date;
  updatedAt: Date;
}
