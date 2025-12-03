import { Body, Controller, Param, Post } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';

@Controller('gyms/:gymId/memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post()
  async createMembership(
    @Param('gymId') gymId: string,
    @Body() body: CreateMembershipDto,
  ) {
    const membership = await this.membershipsService.createForGym(gymId, {
      gymId, // se sobreescribe de todos modos
      userId: body.userId,
      membershipPlanId: body.membershipPlanId,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
    });

    return membership;
  }
}
