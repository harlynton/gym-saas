import { Module } from '@nestjs/common';
import { TicketPacksService } from './ticket-packs.service';
import { TicketPacksController } from './ticket-packs.controller';

@Module({
  providers: [TicketPacksService],
  controllers: [TicketPacksController],
})
export class TicketPacksModule {}
