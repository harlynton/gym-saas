import { GymId } from './gym';
import { UserId } from './user';
import { MembershipPlanId } from './membership-plan';
import { MembershipStatus } from '../enums/membership-status';
import { DateRange } from '../value-objects/date-range';

export type MembershipId = string;

export interface Membership {
  id: MembershipId;
  gymId: GymId;
  userId: UserId;
  membershipPlanId: MembershipPlanId;
  period: DateRange;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}
