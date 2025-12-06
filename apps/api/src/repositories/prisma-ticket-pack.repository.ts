import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import {
  TicketPackRepository,
  TicketPack,
  TicketPackId,
  GymId, 
  UserId, 
  Money, 
  TicketPackStatus as DomainTicketPackStatus 
} from '@gym-saas/core-domain';

// Enum de Prisma
import {
  TicketPackStatus as PrismaTicketPackStatus,
} from '@prisma/client';

@Injectable()
export class PrismaTicketPackRepository implements TicketPackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: TicketPackId): Promise<TicketPack | null> {
    const db = await this.prisma.ticketPack.findUnique({
      where: { id: id as string },
    });

    if (!db) return null;

    return this.mapDbToDomain(db);
  }

async findActiveByUserAndGym(
  userId: UserId,
  gymId: GymId,
): Promise<TicketPack[]> {
  const rows = await this.prisma.ticketPack.findMany({
    where: {
      userId: userId as string,
      gymId: gymId as string,
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'asc' },
  });

  return rows.map((row) => this.mapDbToDomain(row));
}


  async save(ticketPack: TicketPack): Promise<TicketPack> {
    const data = this.mapDomainToDb(ticketPack);

    const db = await this.prisma.ticketPack.upsert({
      where: { id: ticketPack.id as string },
      create: data,
      update: data,
    });

    return this.mapDbToDomain(db);
  }

  // ---------- helpers privados ----------

  private mapDbToDomain(db: any): TicketPack {
    const price: Money = {
      amountCents: db.priceAmount,
      currency: db.priceCurrency,
    };

    return {
      id: db.id as TicketPackId,
      gymId: db.gymId as GymId,
      userId: db.userId as UserId,
      name: db.name,
      totalCredits: db.totalCredits,
      remainingCredits: db.remainingCredits,
      expiresAt: db.expiresAt ?? null,
      price,
      status: db.status as DomainTicketPackStatus,
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
    };
  }

  private mapDomainToDb(ticketPack: TicketPack) {
    return {
      id: ticketPack.id as string,
      gymId: ticketPack.gymId as string,
      userId: ticketPack.userId as string,
      name: ticketPack.name,
      totalCredits: ticketPack.totalCredits,
      remainingCredits: ticketPack.remainingCredits,
      expiresAt: ticketPack.expiresAt,
      priceAmount: ticketPack.price.amountCents,
      priceCurrency: ticketPack.price.currency,
      status: ticketPack.status as PrismaTicketPackStatus,
      createdAt: ticketPack.createdAt,
      updatedAt: ticketPack.updatedAt,
    };
  }
}
