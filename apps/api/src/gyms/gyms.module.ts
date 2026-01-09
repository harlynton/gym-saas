//apps/api/src/gyms/gyms.module.ts
import { Module } from '@nestjs/common';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';

import { PrismaModule } from '../prisma/prisma.module';
import { PrismaGymRepository } from '../repositories/prisma-gym.repository';
import { PrismaGymMemberRepository } from '../repositories/prisma-gym-member.repository';

import { GYM_REPO, GYM_MEMBER_REPO } from '../tokens';

@Module({
  imports:[PrismaModule],
  controllers: [GymsController],
  providers: [
    GymsService,
    { provide: GYM_REPO, useClass: PrismaGymRepository },
    { provide: GYM_MEMBER_REPO, useClass: PrismaGymMemberRepository },
  ],
})
export class GymsModule {}