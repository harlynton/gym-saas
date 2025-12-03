import { Injectable } from '@nestjs/common';
import {
  TicketPack,
  TicketPackId,
  TicketPackRepository,
  GymMemberRepository,
  createTicketPack,
  CreateTicketPackInput,
  CreateTicketPackDeps,
  consumeTicketCredit,
  ConsumeTicketCreditInput,
  ConsumeTicketCreditDeps,
  Money,
  RoleInGym,
} from '@gym-saas/core-domain';
import { CreateTicketPackDto } from './dto/create-ticket-pack.dto';
import { ConsumeTicketCreditDto } from './dto/consume-ticket-credit.dto';

@Injectable()
export class TicketPacksService implements TicketPackRepository {
  // Repositorio en memoria (por ahora)
  private ticketPacks: TicketPack[] = [];

  // Helpers de tiempo e IDs
  private now = () => new Date();

  private generateId = (): TicketPackId =>
    `tp-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

  // Implementación de TicketPackRepository

  async findById(id: TicketPackId): Promise<TicketPack | null> {
    const found = this.ticketPacks.find((p) => p.id === id);
    return found ?? null;
  }

  async findActiveByUserAndGym(
    userId: string,
    gymId: string,
  ): Promise<TicketPack[]> {
    const now = this.now().getTime();

    return this.ticketPacks.filter((p) => {
      if (p.gymId !== gymId) return false;
      if (p.userId !== userId) return false;
      if (p.status !== 'ACTIVE') return false;
      if (p.remainingCredits <= 0) return false;
      if (p.expiresAt && p.expiresAt.getTime() < now) return false;
      return true;
    });
  }

  async save(ticketPack: TicketPack): Promise<TicketPack> {
    const index = this.ticketPacks.findIndex((p) => p.id === ticketPack.id);
    if (index >= 0) {
      this.ticketPacks[index] = ticketPack;
    } else {
      this.ticketPacks.push(ticketPack);
    }
    return ticketPack;
  }

  // GymMemberRepository fake (por ahora).
  // En el futuro lo reemplazas por repos reales (DB).
  private gymMemberRepo: GymMemberRepository = {
    async findByUserAndGym(userId: string, gymId: string) {
      return {
        id: `gm-${userId}-${gymId}`,
        gymId,
        userId,
        role: 'CLIENT' as RoleInGym,
        joinedAt: new Date(),
        isActive: true,
      };
    },

    async findByGymAndRole(_gymId: string, _role: RoleInGym) {
      return [];
    },
  };

  // Métodos públicos que usará el controlador

  async createForGym(
    gymId: string,
    dto: CreateTicketPackDto,
  ): Promise<TicketPack> {
    const price: Money = {
      amountCents: dto.amountCents,
      currency: dto.currency,
    };

    const input: CreateTicketPackInput = {
      gymId,
      userId: dto.userId,
      name: dto.name,
      totalCredits: dto.totalCredits,
      price,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      validDays: dto.validDays,
    };

    const deps: CreateTicketPackDeps = {
      ticketPackRepo: this,
      gymMemberRepo: this.gymMemberRepo,
      generateId: this.generateId,
      now: this.now,
    };

    return createTicketPack(deps, input);
  }

  async consumeForUser(
    gymId: string,
    ticketPackId: string,
    dto: ConsumeTicketCreditDto,
  ): Promise<TicketPack> {
    const input: ConsumeTicketCreditInput = {
      gymId,
      userId: dto.userId,
      ticketPackId,
    };

    const deps: ConsumeTicketCreditDeps = {
      ticketPackRepo: this,
      now: this.now,
    };

    return consumeTicketCredit(deps, input);
  }
}
