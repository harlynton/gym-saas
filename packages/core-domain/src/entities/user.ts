export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
