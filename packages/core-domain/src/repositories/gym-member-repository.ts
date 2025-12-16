// packages/core-domain/src/repositories/gym-member-repository.ts
import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';
import { GymMember } from '../entities/gym-member';
import { RoleInGym } from '../enums/roles';

export interface GymMemberRepository {
  findByUserAndGym(userId: UserId, gymId: GymId): Promise<GymMember | null>;
  findByGymAndRole(gymId: GymId, role: RoleInGym): Promise<GymMember[]>;
  save(member: GymMember): Promise<GymMember>;
}
