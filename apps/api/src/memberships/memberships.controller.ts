import {
  BadRequestException,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
  Body,
  Get,
} from '@nestjs/common';

import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';

import {
  CreateMembershipError,
  GymId,
  UserId, 
  MembershipPlanId, 
  Membership,
  MembershipId
} from '@gym-saas/core-domain';

@Controller('gyms/:gymId/memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post()
  async createMembership(
    @Param('gymId') gymIdParam: string,
    @Body() body: CreateMembershipDto,
  ) {
    const gymId = gymIdParam as GymId;
    const userId = body.userId as UserId;
    const membershipPlanId = body.membershipPlanId as MembershipPlanId;

    const startDate =
      body.startDate != null ? new Date(body.startDate) : undefined;

    try {
      const membership = await this.membershipsService.createMembership({
        gymId,
        userId,
        membershipPlanId,
        startDate,
      });

      return membership;
    } catch (error) {
      if (error instanceof CreateMembershipError) {
        switch (error.code) {
          case 'PLAN_NOT_FOUND':
            throw new NotFoundException(error.message);
          case 'PLAN_NOT_IN_GYM':
          case 'USER_NOT_MEMBER_OF_GYM':
            throw new BadRequestException(error.message);
          case 'ACTIVE_MEMBERSHIP_EXISTS':
            throw new ConflictException(error.message);
          default:
            throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }

  //Obtener membresia por ID:
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Membership | null> {
    return this.membershipsService.findById(id as MembershipId);
  }

  //Listar todas las membresias de un Gym:
  @Get('gym/:gymId')
  async findByGym(
    @Param('gymId') gymId: string,
  ): Promise<Membership[]> {
    return this.membershipsService.findByGym(gymId as GymId);
  }

  //Obtener la membresia activa de un usuario en un gym:
  @Get('gym/:gymId/user/:userId/active')
  async findActiveByUserAndGym(
    @Param('gymId') gymId: string,
    @Param('userId') userId: string,
  ): Promise<Membership | null> {
    return this.membershipsService.findActiveByUserAndGym(
      userId as UserId,
      gymId as GymId,
    );
  }
}
