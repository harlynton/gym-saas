import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaMembershipPlanRepository } from '../repositories/prisma-membership-plan.repository';
import { PrismaMembershipRepository } from '../repositories/prisma-membership.repository';
import { PrismaGymMemberRepository } from '../repositories/prisma-gym-member.repository';

import {
  createMembership,
  CreateMembershipError,
  CreateMembershipInput,
} from '@gym-saas/core-domain';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly membershipPlanRepo: PrismaMembershipPlanRepository,
    private readonly membershipRepo: PrismaMembershipRepository,
    private readonly gymMemberRepo: PrismaGymMemberRepository,
  ) {}

  async createMembership(input: CreateMembershipInput) {
    try {
      return await createMembership(
        {
          membershipPlanRepo: this.membershipPlanRepo,
          membershipRepo: this.membershipRepo,
          gymMemberRepo: this.gymMemberRepo,
          generateId: () => randomUUID(),
          now: () => new Date(),
        },
        input,
      );
    } catch (error) {
      if (error instanceof CreateMembershipError) {
        // re-lanzamos para que el controller lo mapee a HTTP
        throw error;
      }
      throw error;
    }
  }
}
