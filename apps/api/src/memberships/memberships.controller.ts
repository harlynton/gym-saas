import {
  BadRequestException,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
  Body,
} from '@nestjs/common';

import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';

import {
  CreateMembershipError,
  GymId,
  UserId, 
  MembershipPlanId 
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
}
