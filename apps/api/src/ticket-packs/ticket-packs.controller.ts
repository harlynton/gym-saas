import {
  BadRequestException,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
  Body,
} from '@nestjs/common';

import { TicketPacksService } from './ticket-packs.service';
import { CreateTicketPackBodyDto } from './dto/create-ticket-pack.dto';

import {
  CreateTicketPackError,
  ConsumeTicketCreditError,
  GymId, 
  UserId, 
  TicketPackId 
} from '@gym-saas/core-domain';

@Controller('gyms/:gymId')
export class TicketPacksController {
  constructor(private readonly ticketPacksService: TicketPacksService) {}

  // POST /gyms/:gymId/ticket-packs
  @Post('ticket-packs')
  async createTicketPack(
    @Param('gymId') gymIdParam: string,
    @Body() body: CreateTicketPackBodyDto,
  ) {
    const gymId = gymIdParam as GymId;
    const userId = body.userId as UserId;

    const expiresAt =
      body.expiresAt != null ? new Date(body.expiresAt) : undefined;

    try {
      const pack = await this.ticketPacksService.createTicketPack({
        gymId,
        userId,
        name: body.name,
        totalCredits: body.totalCredits,
        price: {
          amountCents: body.priceAmount,
          currency: body.priceCurrency,
        },
        expiresAt,
      });

      return pack;
    } catch (error) {
      if (error instanceof CreateTicketPackError) {
        switch (error.code) {
          case 'USER_NOT_MEMBER_OF_GYM':
          case 'USER_NOT_ACTIVE_MEMBER':
            throw new BadRequestException(error.message);
          default:
            throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }

  // POST /gyms/:gymId/users/:userId/ticket-packs/:ticketPackId/consume-credit
  @Post('users/:userId/ticket-packs/:ticketPackId/consume-credit')
  async consumeTicketCredit(
    @Param('gymId') gymIdParam: string,
    @Param('userId') userIdParam: string,
    @Param('ticketPackId') ticketPackIdParam: string,
  ) {
    const gymId = gymIdParam as GymId;
    const userId = userIdParam as UserId;
    const ticketPackId = ticketPackIdParam as TicketPackId;

    try {
      const updatedPack = await this.ticketPacksService.consumeTicketCredit({
        gymId,
        userId,
        ticketPackId,
      });

      return updatedPack;
    } catch (error) {
      if (error instanceof ConsumeTicketCreditError) {
        switch (error.code) {
          case 'TICKET_PACK_NOT_FOUND':
            throw new NotFoundException(error.message);
          case 'TICKET_PACK_NOT_IN_GYM':
          case 'TICKET_PACK_NOT_OWNED_BY_USER':
          case 'TICKET_PACK_NOT_ACTIVE':
          case 'TICKET_PACK_EXPIRED':
          case 'NO_REMAINING_CREDITS':
            throw new BadRequestException(error.message);
          default:
            throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }
}
