import { GymId } from './gym';
import { UserId } from './user';
import { RoleInGym } from '../enums/roles';

export type GymMemberId = string;

export interface GymMember {
  id: GymMemberId;
  gymId: GymId;
  userId: UserId;
  role: RoleInGym;
  joinedAt: Date;
  isActive: boolean;
}
