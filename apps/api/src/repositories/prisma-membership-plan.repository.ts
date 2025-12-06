import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import {
  MembershipPlanRepository,
  MembershipPlan,
  MembershipPlanId,
  GymId, 
  Money 
} from '@gym-saas/core-domain';

@Injectable()
export class PrismaMembershipPlanRepository implements MembershipPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: MembershipPlanId): Promise<MembershipPlan | null> {
    const db = await this.prisma.membershipPlan.findUnique({
      where: { id: id as string },
    });

    if (!db) return null;

    return this.mapDbToDomain(db);
  }

  async findByGym(gymId: GymId): Promise<MembershipPlan[]> {
    const rows = await this.prisma.membershipPlan.findMany({
      where: { gymId: gymId as string },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => this.mapDbToDomain(row));
  }

  // ---------- helpers privados ----------

  private mapDbToDomain(db: any): MembershipPlan {
    const price: Money = {
      amountCents: db.priceAmount,
      currency: db.priceCurrency,
    };

    return {
      id: db.id as MembershipPlanId,
      gymId: db.gymId as GymId,
      name: db.name,
      durationDays: db.durationDays,
      price,
      allowsSpinning: db.allowsSpinning,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    };
  }
}
