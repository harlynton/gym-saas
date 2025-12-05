import { createMembership, CreateMembershipError } from './create-membership';
import { MembershipPlanRepository } from '../repositories/membership-plan-repository';
import { MembershipRepository } from '../repositories/membership-repository';
import { GymMemberRepository } from '../repositories/gym-member-repository';
import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';
import { Membership, MembershipId } from '../entities/membership';
import { MembershipStatus } from '../enums/membership-status';
import { MembershipPlanId } from '../entities/membership-plan';

describe('createMembership', () => {
  const gymId: GymId = 'gym-1';
  const userId: UserId = 'user-1';
  const planId: MembershipPlanId = 'plan-1';
  const fixedNow = new Date('2025-01-01T10:00:00.000Z');
  const generatedId: MembershipId = 'membership-1';

  let membershipPlanRepo: jest.Mocked<MembershipPlanRepository>;
  let membershipRepo: jest.Mocked<MembershipRepository>;
  let gymMemberRepo: jest.Mocked<GymMemberRepository>;
  let generateId: jest.Mock;
  let now: jest.Mock;

  beforeEach(() => {
    membershipPlanRepo = {
      findById: jest.fn(),
      // agrega otros métodos si existen
    } as unknown as jest.Mocked<MembershipPlanRepository>;

    membershipRepo = {
      findActiveByUserAndGym: jest.fn(),
      save: jest.fn(),
      // agrega otros métodos si existen
    } as unknown as jest.Mocked<MembershipRepository>;

    gymMemberRepo = {
      findByUserAndGym: jest.fn(),
      // agrega otros métodos si existen
    } as unknown as jest.Mocked<GymMemberRepository>;

    generateId = jest.fn().mockReturnValue(generatedId);
    now = jest.fn().mockReturnValue(fixedNow);
  });

  const deps = () => ({
    membershipPlanRepo,
    membershipRepo,
    gymMemberRepo,
    generateId: generateId as () => MembershipId,
    now: now as () => Date,
  });

  const baseInput = () => ({
    gymId,
    userId,
    membershipPlanId: planId,
  });

  const fakePlan = (overrides: Partial<any> = {}) =>
    ({
      id: planId,
      gymId,
      name: 'Mensual',
      durationDays: 30,
      price: {} as any,
      createdAt: fixedNow,
      updatedAt: fixedNow,
      ...overrides,
    } as any);

  const fakeMember = (overrides: Partial<any> = {}) =>
    ({
      id: 'member-1',
      gymId,
      userId,
      isActive: true,
      createdAt: fixedNow,
      updatedAt: fixedNow,
      ...overrides,
    } as any);

  const fakeMembership = (overrides: Partial<Membership> = {}): Membership =>
    ({
      id: generatedId,
      gymId,
      userId,
      membershipPlanId: planId,
      period: {
        startDate: fixedNow,
        endDate: new Date('2025-01-31T10:00:00.000Z'),
      },
      status: 'ACTIVE' as MembershipStatus,
      createdAt: fixedNow,
      updatedAt: fixedNow,
      ...overrides,
    });

  it('debería crear una membresía activa cuando todo es válido y usar now() como startDate por defecto', async () => {
    const plan = fakePlan({ durationDays: 30 });
    membershipPlanRepo.findById.mockResolvedValue(plan);
    gymMemberRepo.findByUserAndGym.mockResolvedValue(fakeMember());
    membershipRepo.findActiveByUserAndGym.mockResolvedValue(null);
    membershipRepo.save.mockImplementation(async (m: Membership) => m);

    const input = baseInput();

    const result = await createMembership(deps(), input);

    // Validaciones de llamadas
    expect(membershipPlanRepo.findById).toHaveBeenCalledWith(planId);
    expect(gymMemberRepo.findByUserAndGym).toHaveBeenCalledWith(userId, gymId);
    expect(membershipRepo.findActiveByUserAndGym).toHaveBeenCalledWith(
      userId,
      gymId,
    );
    expect(generateId).toHaveBeenCalledTimes(1);
    expect(now).toHaveBeenCalled(); // se usa para startDate / createdAt / updatedAt

    expect(membershipRepo.save).toHaveBeenCalledTimes(1);
    const saved = membershipRepo.save.mock.calls[0][0] as Membership;

    // id generado
    expect(saved.id).toBe(generatedId);

    // gym, user, plan
    expect(saved.gymId).toBe(gymId);
    expect(saved.userId).toBe(userId);
    expect(saved.membershipPlanId).toBe(planId);

    // periodo
    expect(saved.period.startDate).toEqual(fixedNow);
    // fixedNow + 30 días
    const expectedEnd = new Date(fixedNow.getTime());
    expectedEnd.setDate(expectedEnd.getDate() + plan.durationDays);
    expect(saved.period.endDate.toISOString()).toBe(expectedEnd.toISOString());

    // estado
    expect(saved.status).toBe<'ACTIVE' | MembershipStatus>('ACTIVE');

    // timestamps
    expect(saved.createdAt).toEqual(fixedNow);
    expect(saved.updatedAt).toEqual(fixedNow);

    // resultado
    expect(result).toEqual(saved);
  });

  it('debería respetar un startDate custom enviado en el input', async () => {
    const plan = fakePlan({ durationDays: 10 });
    membershipPlanRepo.findById.mockResolvedValue(plan);
    gymMemberRepo.findByUserAndGym.mockResolvedValue(fakeMember());
    membershipRepo.findActiveByUserAndGym.mockResolvedValue(null);
    membershipRepo.save.mockImplementation(async (m: Membership) => m);

    const customStart = new Date('2025-02-01T00:00:00.000Z');

    const input = {
      ...baseInput(),
      startDate: customStart,
    };

    const result = await createMembership(deps(), input);

    const saved = membershipRepo.save.mock.calls[0][0] as Membership;

    expect(saved.period.startDate).toEqual(customStart);

    const expectedEnd = new Date(customStart.getTime());
    expectedEnd.setDate(expectedEnd.getDate() + plan.durationDays);
    expect(saved.period.endDate.toISOString()).toBe(expectedEnd.toISOString());

    expect(result.period.startDate).toEqual(customStart);
    expect(result.period.endDate.toISOString()).toBe(expectedEnd.toISOString());
  });

  it('debería lanzar PLAN_NOT_FOUND cuando no existe el plan', async () => {
    membershipPlanRepo.findById.mockResolvedValue(null);

    await expect(
      createMembership(deps(), baseInput()),
    ).rejects.toBeInstanceOf(CreateMembershipError);

    await expect(
      createMembership(deps(), baseInput()),
    ).rejects.toMatchObject<CreateMembershipError>({
      code: 'PLAN_NOT_FOUND',
    } as any);
  });

  it('debería lanzar PLAN_NOT_IN_GYM cuando el plan pertenece a otro gym', async () => {
    const otherGymPlan = fakePlan({ gymId: 'other-gym' as GymId });
    membershipPlanRepo.findById.mockResolvedValue(otherGymPlan);

    await expect(
      createMembership(deps(), baseInput()),
    ).rejects.toMatchObject<CreateMembershipError>({
      code: 'PLAN_NOT_IN_GYM',
    } as any);
  });

  it('debería lanzar USER_NOT_MEMBER_OF_GYM cuando el usuario no es miembro activo', async () => {
    const plan = fakePlan();
    membershipPlanRepo.findById.mockResolvedValue(plan);

    // Caso 1: no hay registro de miembro
    gymMemberRepo.findByUserAndGym.mockResolvedValue(null);

    await expect(
      createMembership(deps(), baseInput()),
    ).rejects.toMatchObject<CreateMembershipError>({
      code: 'USER_NOT_MEMBER_OF_GYM',
    } as any);

    // Caso 2: miembro pero inactivo
    gymMemberRepo.findByUserAndGym.mockResolvedValue(
      fakeMember({ isActive: false }),
    );
    membershipRepo.findActiveByUserAndGym.mockResolvedValue(null);

    await expect(
      createMembership(deps(), baseInput()),
    ).rejects.toMatchObject<CreateMembershipError>({
      code: 'USER_NOT_MEMBER_OF_GYM',
    } as any);
  });

  it('debería lanzar ACTIVE_MEMBERSHIP_EXISTS cuando ya tiene una membresía activa en el gym', async () => {
    const plan = fakePlan();
    membershipPlanRepo.findById.mockResolvedValue(plan);
    gymMemberRepo.findByUserAndGym.mockResolvedValue(fakeMember());

    const existing = fakeMembership();
    membershipRepo.findActiveByUserAndGym.mockResolvedValue(existing);

    await expect(
      createMembership(deps(), baseInput()),
    ).rejects.toMatchObject<CreateMembershipError>({
      code: 'ACTIVE_MEMBERSHIP_EXISTS',
    } as any);
  });
});
