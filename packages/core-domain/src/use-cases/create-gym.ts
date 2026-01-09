// packages/core-domain/src/use-cases/create-gym.ts
import { Gym, GymId } from '../entities/gym';
import { GymMember, GymMemberId } from '../entities/gym-member';
import { UserId } from '../entities/user';
import { RoleInGym } from '../enums/roles';
import { GymMemberRepository } from '../repositories/gym-member-repository';
import { GymRepository } from '../repositories/gym-repository';

// Input del caso de uso
export interface CreateGymInput {
  name: string;
  ownerUserId: UserId;
}

// Errores de dominio específicos (dejamos pocos por ahora)
export class CreateGymError extends Error {
  readonly code: 'INVALID_NAME' | 'SLUG_ALREADY_EXISTS';

  constructor(code: CreateGymError['code'], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

// Dependencias inyectables
export interface CreateGymDeps {
  gymRepo: GymRepository;
  gymMemberRepo: GymMemberRepository;
  generateGymId: () => GymId;
  generateGymMemberId: () => GymMemberId;
  now: () => Date;
}

function slugify(input: string): string {
  //trim + lower + quitar tildes + dejar [a-z0-9-]
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // quita diacríticos

  const slug = normalized
    .replace(/[^a-z0-9\s-]/g, '') // quita símbolos raros
    .replace(/\s+/g, '-')         // espacios -> -
    .replace(/-+/g, '-')          // colapsa ---
    .replace(/^-|-$/g, '');       // quita - al inicio/fin

  return slug;
}


// Caso de uso
export async function createGym(
  deps: CreateGymDeps,
  input: CreateGymInput,
): Promise<Gym> {
  const { gymRepo, gymMemberRepo, generateGymId, generateGymMemberId, now } = deps;
  const { name, ownerUserId } = input;

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new CreateGymError('INVALID_NAME', 'Gym name cannot be empty');
  }

  const baseSlug = slugify(trimmedName);
  if (!baseSlug) {
    throw new CreateGymError('INVALID_NAME', 'Gym name produces an invalid slug');
  }

  //Generar slug único (my-gym, my-gym-2, my-gym-3...)
  let slug = baseSlug;
  for (let attempt = 0; attempt < 50; attempt++) {
    const exists = await gymRepo.findBySlug(slug);
    if (!exists) break;

    slug = `${baseSlug}-${attempt + 2}`; // -2, -3...
    if (attempt === 49) {
      throw new CreateGymError('SLUG_ALREADY_EXISTS', 'Could not generate a unique slug');
    }
  }

  //Crear Gym
  const gym: Gym = {
    id: generateGymId(),
    name: trimmedName,
    slug,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  };

  const savedGym = await gymRepo.save(gym);

  //Vincular al dueño como OWNER del gym
  const gymMember: GymMember = {
    id: generateGymMemberId(),
    gymId: savedGym.id,
    userId: ownerUserId,
    role: 'OWNER' as RoleInGym,
    isActive: true,
    joinedAt: now(),
  };

  await gymMemberRepo.save(gymMember);

  return savedGym;
}
