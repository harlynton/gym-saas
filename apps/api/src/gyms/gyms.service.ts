//apps/api/src/gyms/gym.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { GYM_REPO, GYM_MEMBER_REPO } from '../tokens';
import { createGym, Gym, GymId, GymMemberId, GymMemberRepository, GymRepository, UserId } from '@gym-saas/core-domain';

@Injectable()
export class GymsService {
  constructor(
    @Inject(GYM_REPO) private readonly gymRepo: GymRepository,
    @Inject(GYM_MEMBER_REPO) private readonly gymMemberRepo: GymMemberRepository,
  ) {}

  async create(input: { name: string; ownerUserId: string }): Promise<Gym> {
    try {
      return await createGym(
        {
          gymRepo: this.gymRepo,
          gymMemberRepo: this.gymMemberRepo,
          generateGymId: () => randomUUID() as GymId,
          generateGymMemberId: () => randomUUID() as GymMemberId,
          now: () => new Date(),
        },
        { name: input.name, ownerUserId: input.ownerUserId as UserId },
      );
    } catch (e) {
      // IMPORTANTE: aquí NO lances {code:'...'} (eso causó tu error)
      // Lanza la instancia del error, o tradúcelo en el controller.
      throw e;
    }
  }
}
