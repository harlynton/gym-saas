import { GymId } from './gym';
import { UserId } from './user';
import { SpinningClassId } from './spinning-class';

export type SpinningBookingId = string;

export type SpinningBookingStatus = 'BOOKED' | 'CANCELLED' | 'ATTENDED' | 'NO_SHOW';

export interface SpinningBooking {
  id: SpinningBookingId;
  gymId: GymId;
  spinningClassId: SpinningClassId;
  userId: UserId;
  status: SpinningBookingStatus;
  createdAt: Date;
  updatedAt: Date;
}
