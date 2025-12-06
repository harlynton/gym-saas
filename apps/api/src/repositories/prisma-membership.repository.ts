import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import {
  MembershipRepository,
  Membership,
  MembershipId,
  GymId,
  UserId,
  MembershipStatus as DomainMembershipStatus,
  MembershipPlanId, DateRange 
} from '@gym-saas/core-domain';

// Enum de Prisma (BD)
import {
  MembershipStatus as PrismaMembershipStatus,
} from '@prisma/client';

@Injectable()
export class PrismaMembershipRepository implements MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 🔍 Buscar membresía por ID
  async findById(id: MembershipId): Promise<Membership | null> {
    const db = await this.prisma.membership.findUnique({
      where: { id: id as string },
    });

    if (!db) return null;

    return this.mapDbToDomain(db);
  }

  // 🔍 Buscar membresías por gimnasio
  async findByGym(gymId: GymId): Promise<Membership[]> {
    const rows = await this.prisma.membership.findMany({
      where: { gymId: gymId as string },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => this.mapDbToDomain(row));
  }

  // 🔍 Buscar membresía activa por usuario + gym (para createMembership)
  async findActiveByUserAndGym(
    userId: UserId,
    gymId: GymId,
  ): Promise<Membership | null> {
    const db = await this.prisma.membership.findFirst({
      where: {
        userId: userId as string,
        gymId: gymId as string,
        status: 'ACTIVE', // coincide con el enum de Prisma
      },
    });

    if (!db) return null;

    return this.mapDbToDomain(db);
  }

  // 💾 Guardar/actualizar una membresía
  async save(membership: Membership): Promise<Membership> {
    const data = this.mapDomainToDb(membership);

    const db = await this.prisma.membership.upsert({
      where: { id: membership.id as string },
      create: data,
      update: data,
    });

    return this.mapDbToDomain(db);
  }

  // ---------- helpers privados ----------

  private mapDbToDomain(db: any): Membership {
    const period: DateRange = {
      startDate: db.startDate,
      endDate: db.endDate,
    };

    return {
      id: db.id as MembershipId,
      gymId: db.gymId as GymId,
      userId: db.userId as UserId,
      membershipPlanId: db.membershipPlanId as MembershipPlanId,
      period,
      status: db.status as DomainMembershipStatus,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    };
  }

  private mapDomainToDb(m: Membership) {
    return {
      id: m.id as string,
      gymId: m.gymId as string,
      userId: m.userId as string,
      membershipPlanId: m.membershipPlanId as string,
      startDate: m.period.startDate,
      endDate: m.period.endDate,
      status: m.status as PrismaMembershipStatus,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }
}
