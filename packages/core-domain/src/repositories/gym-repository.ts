// packages/core-domain/src/repositories/gym-repository.ts
import { Gym, GymId } from '../entities/gym';

export interface GymRepository {
  save(gym: Gym): Promise<Gym>;
  findById(id: GymId): Promise<Gym | null>;
}
