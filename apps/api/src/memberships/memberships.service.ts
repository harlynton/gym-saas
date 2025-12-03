import { Injectable } from '@nestjs/common';
import {
  createMembership,
  CreateMembershipInput,
  CreateMembershipDeps,
  Membership,
} from '@gym-saas/core-domain';

// TODO: reemplazar esto por repositorios reales (Prisma, TypeORM, etc.)
const fakeMembershipPlanRepo = {
  async findById(planId: string) {
    // Demo: plan de 30 días
    return {
      id: planId,
      gymId: 'gym-demo',
      name: 'Mensualidad',
      description: 'Plan mensual estándar',
      durationDays: 30,
      price: { amountCents: 80000, currency: 'COP' },
      allowsSpinning: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
  async findByGym(_gymId: string) {
    return [];
  },
};

const fakeGymMemberRepo = {
  async findByUserAndGym(userId: string, gymId: string) {
    return {
      id: 'gm-1',
      gymId,
      userId,
      role: 'CLIENT' as const,
      joinedAt: new Date(),
      isActive: true,
    };
  },
  async findByGymAndRole(_gymId: string, _role: any) {
    return [];
  },
};

const fakeMembershipRepo = {
  async findActiveByUserAndGym(_userId: string, _gymId: string) {
    return null; // asumiendo que no tiene otra activa
  },
  async save(membership: Membership) {
    // en un caso real: aquí guardas en DB y devuelves la versión persistida
    return membership;
  },
  async findById(_id: string) {
    return null;
  },
  async findByGym(_gymId: string) {
    return [];
  },
};

@Injectable()
export class MembershipsService {
  async createForGym(gymId: string, input: CreateMembershipInput): Promise<Membership> {
    const deps: CreateMembershipDeps = {
      membershipPlanRepo: fakeMembershipPlanRepo,
      gymMemberRepo: fakeGymMemberRepo,
      membershipRepo: fakeMembershipRepo,
      generateId: () => `mem-${Date.now()}`,
      now: () => new Date(),
    };

    return createMembership(deps, { ...input, gymId });
  }
}
