import { GymId } from '../entities/gym';
import { MembershipPlan, MembershipPlanId } from '../entities/membership-plan';

export interface MembershipPlanRepository {
  findById(planId: MembershipPlanId): Promise<MembershipPlan | null>;
  findByGym(gymId: GymId): Promise<MembershipPlan[]>;
}
