import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { PrismaModule } from '../prisma/prisma.module';

import { PrismaMembershipPlanRepository } from '../repositories/prisma-membership-plan.repository';
import { PrismaMembershipRepository } from '../repositories/prisma-membership.repository';
import { PrismaGymMemberRepository } from '../repositories/prisma-gym-member.repository';

@Module({
  imports: [PrismaModule],
  controllers: [MembershipsController],
  providers: [
    MembershipsService,
    PrismaMembershipPlanRepository,
    PrismaMembershipRepository,
    PrismaGymMemberRepository,
  ],
})
export class MembershipsModule {}
