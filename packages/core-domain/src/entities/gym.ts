export type GymId = string;

export interface Gym {
  id: GymId;
  name: string;
  slug: string;           // para subdominio o URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
