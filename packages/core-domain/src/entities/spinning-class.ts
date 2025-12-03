import { GymId } from './gym';
import { UserId } from './user';

export type SpinningClassId = string;

export interface SpinningClass {
  id: SpinningClassId;
  gymId: GymId;
  title: string;
  description?: string;
  startsAt: Date;
  durationMinutes: number;
  capacity: number;
  trainerId: UserId;      // entrenador responsable
  createdAt: Date;
  updatedAt: Date;
}
