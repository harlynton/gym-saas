import { GymId } from './gym';
import { Money } from '../value-objects/money';

export type MembershipPlanId = string;

export interface MembershipPlan {
  id: MembershipPlanId;
  gymId: GymId;
  name: string;
  description?: string;
  durationDays: number;      // 30, 60, 90, etc.
  price: Money;
  allowsSpinning: boolean;
  createdAt: Date;
  updatedAt: Date;
}
