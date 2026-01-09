import { createGym, CreateGymError } from './create-gym';
import { GymRepository } from '../repositories/gym-repository';
import { GymMemberRepository } from '../repositories/gym-member-repository';

describe('createGym', () => {
  const fixedNow = new Date('2025-12-26T10:00:00.000Z');
  const now = () => fixedNow;

  const generateGymId = () => 'gym_1' as any;
  const generateGymMemberId = () => 'gm_1' as any;

  function makeDeps(overrides?: Partial<{
    gymRepo: GymRepository;
    gymMemberRepo: GymMemberRepository;
  }>) {
    const gymRepo: GymRepository = overrides?.gymRepo ?? {
      save: jest.fn(async (g) => g),
      findById: jest.fn(async () => null),
      findBySlug: jest.fn(async () => null),
    };

    const gymMemberRepo: GymMemberRepository = overrides?.gymMemberRepo ?? {
      findByUserAndGym: jest.fn(async () => null),
      findByGymAndRole: jest.fn(async () => []),
      save: jest.fn(async (m) => m),
    };

    return { gymRepo, gymMemberRepo, generateGymId, generateGymMemberId, now };
  }

  it('throws INVALID_NAME when name is empty', async () => {
    const deps = makeDeps();
    await expect(
      createGym(deps, { name: '   ', ownerUserId: 'u1' as any }),
    ).rejects.toMatchObject({ code: 'INVALID_NAME' });
  });

  it('creates gym with slug and OWNER member', async () => {
    const deps = makeDeps();
    const gym = await createGym(deps, { name: 'Demo Gym', ownerUserId: 'u1' as any });

    expect(gym.slug).toBe('demo-gym');
    expect(deps.gymRepo.save).toHaveBeenCalledTimes(1);
    expect(deps.gymMemberRepo.save).toHaveBeenCalledTimes(1);
  });

  it('adds suffix when slug already exists', async () => {
    const gymRepo: GymRepository = {
      save: jest.fn(async (g) => g),
      findById: jest.fn(async () => null),
      findBySlug: jest
        .fn()
        .mockResolvedValueOnce({ id: 'x', name: 'X', slug: 'demo-gym', isActive: true, createdAt: fixedNow, updatedAt: fixedNow } as any)
        .mockResolvedValueOnce(null),
    };

    const deps = makeDeps({ gymRepo });
    const gym = await createGym(deps, { name: 'Demo Gym', ownerUserId: 'u1' as any });

    expect(gym.slug).toBe('demo-gym-2');
  });
});
