import { Body, Controller, Param, Post } from '@nestjs/common';
import { TicketPacksService } from './ticket-packs.service';
import { CreateTicketPackDto } from './dto/create-ticket-pack.dto';
import { ConsumeTicketCreditDto } from './dto/consume-ticket-credit.dto';

@Controller('gyms/:gymId/ticket-packs')
export class TicketPacksController {
  constructor(private readonly ticketPacksService: TicketPacksService) {}

  @Post()
  async createTicketPack(
    @Param('gymId') gymId: string,
    @Body() body: CreateTicketPackDto,
  ) {
    const pack = await this.ticketPacksService.createForGym(gymId, body);
    return pack;
  }

  @Post(':ticketPackId/consume')
  async consumeTicket(
    @Param('gymId') gymId: string,
    @Param('ticketPackId') ticketPackId: string,
    @Body() body: ConsumeTicketCreditDto,
  ) {
    const pack = await this.ticketPacksService.consumeForUser(
      gymId,
      ticketPackId,
      body,
    );
    return pack;
  }
}
