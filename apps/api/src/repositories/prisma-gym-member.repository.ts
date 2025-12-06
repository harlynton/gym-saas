import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import {
  GymMemberRepository,
  GymMember,
  GymMemberId,
  GymId,  
  UserId 
} from '@gym-saas/core-domain';

// 👇 Inferimos el tipo de rol desde la entidad del dominio
type GymMemberRole = GymMember['role'];

@Injectable()
export class PrismaGymMemberRepository implements GymMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndGym(
    userId: UserId,
    gymId: GymId,
  ): Promise<GymMember | null> {
    const db = await this.prisma.gymMember.findUnique({
      where: {
        gymId_userId: {
          gymId: gymId as string,
          userId: userId as string,
        },
      },
    });

    if (!db) return null;

    return this.mapDbToDomain(db);
  }

  async findByGymAndRole(
    gymId: GymId,
    role: GymMemberRole,
  ): Promise<GymMember[]> {
    const rows = await this.prisma.gymMember.findMany({
      where: {
        gymId: gymId as string,
        role: role as string,
      },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => this.mapDbToDomain(row));
  }

  private mapDbToDomain(db: any): GymMember {
    return {
      id: db.id as GymMemberId,
      gymId: db.gymId as GymId,
      userId: db.userId as UserId,
      role: db.role as GymMemberRole,
      isActive: db.isActive,
      joinedAt: db.createdAt,
    };
  }
}
