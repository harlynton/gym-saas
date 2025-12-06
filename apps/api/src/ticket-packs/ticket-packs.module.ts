import { Module } from '@nestjs/common';
import { TicketPacksController } from './ticket-packs.controller';
import { TicketPacksService } from './ticket-packs.service';
import { PrismaModule } from '../prisma/prisma.module';

import { PrismaTicketPackRepository } from '../repositories/prisma-ticket-pack.repository';
import { PrismaGymMemberRepository } from '../repositories/prisma-gym-member.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TicketPacksController],
  providers: [
    TicketPacksService,
    PrismaTicketPackRepository,
    PrismaGymMemberRepository,
  ],
})
export class TicketPacksModule {}
