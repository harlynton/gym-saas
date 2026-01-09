// apps/api/src/repositories/prisma-gym.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymError, Gym, GymId, GymRepository } from '@gym-saas/core-domain';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaGymRepository implements GymRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(gym: Gym): Promise<Gym> {
    try {
    const saved = await this.prisma.gym.upsert({
      where: { id: gym.id },
      update: {
        name: gym.name,
        updatedAt: gym.updatedAt,
      },
      create: {
        id: gym.id,
        name: gym.name,
        slug: gym.slug,
        isActive: gym.isActive,
        createdAt: gym.createdAt,
        updatedAt: gym.updatedAt,
      },
    });

      return {
        id: saved.id as GymId,
        name: saved.name,
        slug: saved.slug,
        isActive: saved.isActive,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };
  }catch  (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      // si el unique violado incluye slug
      const target = (e.meta as any)?.target as string[] | undefined;
      if (!target || target.includes('slug')) {
        throw new CreateGymError('INVALID_NAME', 'Slug already exists');
      }
    }
    throw e;
  }


  }

  async findById(id: GymId): Promise<Gym | null> {
    const found = await this.prisma.gym.findUnique({
      where: { id },
    });

    if (!found) return null;

    return {
      id: found.id as GymId,
      name: found.name,
      slug: found.slug,
      isActive: found.isActive,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    };
  }

    async findBySlug(slug: string): Promise<Gym | null> {
    const found = await this.prisma.gym.findUnique({
      where: { slug },
    });

    if (!found) return null;

    return {
      id: found.id as GymId,
      name: found.name,
      slug: found.slug,
      isActive: found.isActive,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    };
  }

}
