import { Membership, MembershipId } from '../entities/membership';
import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';

export interface MembershipRepository {
  findActiveByUserAndGym(userId: UserId, gymId: GymId): Promise<Membership | null>;
  save(membership: Membership): Promise<Membership>;
  findById(id: MembershipId): Promise<Membership | null>;
  findByGym(gymId: GymId): Promise<Membership[]>;
}
