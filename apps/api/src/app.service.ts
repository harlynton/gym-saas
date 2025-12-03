import { Injectable } from '@nestjs/common';
import { Gym } from '@gym-saas/core-domain';

@Injectable()
export class AppService {
  getHello(): string {
    const demoGym: Gym = {
      id: 'gym-demo',
      name: 'Demo Gym',
      slug: 'demo-gym',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return `Gym activo: ${demoGym.name}`;
  }
}
