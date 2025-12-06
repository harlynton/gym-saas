import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaTicketPackRepository } from '../repositories/prisma-ticket-pack.repository';
import { PrismaGymMemberRepository } from '../repositories/prisma-gym-member.repository';

import {
  createTicketPack,
  CreateTicketPackError,
  CreateTicketPackInput,
  consumeTicketCredit,
  ConsumeTicketCreditError,
  ConsumeTicketCreditInput,
} from '@gym-saas/core-domain';

@Injectable()
export class TicketPacksService {
  constructor(
    private readonly ticketPackRepo: PrismaTicketPackRepository,
    private readonly gymMemberRepo: PrismaGymMemberRepository,
  ) {}

  async createTicketPack(input: CreateTicketPackInput) {
    try {
      return await createTicketPack(
        {
          ticketPackRepo: this.ticketPackRepo,
          gymMemberRepo: this.gymMemberRepo,
          generateId: () => randomUUID(),
          now: () => new Date(),
        },
        input,
      );
    } catch (error) {
      if (error instanceof CreateTicketPackError) {
        throw error;
      }
      throw error;
    }
  }

  async consumeTicketCredit(input: ConsumeTicketCreditInput) {
    try {
      return await consumeTicketCredit(
        {
          ticketPackRepo: this.ticketPackRepo,
          now: () => new Date(),
        },
        input,
      );
    } catch (error) {
      if (error instanceof ConsumeTicketCreditError) {
        throw error;
      }
      throw error;
    }
  }
}
