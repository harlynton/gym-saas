import { createTicketPack } from './create-ticket-pack';
import { TicketPackRepository } from '../repositories/ticket-pack-repository';
import { TicketPack, TicketPackId } from '../entities/ticket-pack';
import { TicketPackStatus } from '../enums/ticket-pack-status';
import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';
import { GymMemberRepository } from '../repositories/gym-member-repository';

describe('createTicketPack', () => {
  const gymId: GymId = 'gym-1';
  const userId: UserId = 'user-1';
  const fixedNow = new Date('2025-01-01T10:00:00.000Z');
  const generatedId: TicketPackId = 'generated-pack-id';

  let ticketPackRepo: jest.Mocked<TicketPackRepository>;
  let gymMemberRepo: jest.Mocked<GymMemberRepository>;
  let generateId: jest.Mock;

  beforeEach(() => {
    ticketPackRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      // agrega otros métodos si tu interfaz los tiene
    } as unknown as jest.Mocked<TicketPackRepository>;

    gymMemberRepo = {
      findByUserAndGym: jest.fn(),
      // idem: agrega otros métodos si existen
    } as unknown as jest.Mocked<GymMemberRepository>;

    generateId = jest.fn().mockReturnValue(generatedId);
  });

  const deps = () => ({
    ticketPackRepo,
    gymMemberRepo,
    now: () => fixedNow,
    generateId: generateId as () => TicketPackId,
  });

  const baseInput = () => ({
    gymId,
    userId,
    name: '10 clases de spinning',
    totalCredits: 10,
    expiresAt: null as Date | null,
    price: {} as any, // 👈 parche temporal hasta alinear bien el tipo Money
  });

  const fakeMember = () =>
    ({
      id: 'member-1',
      gymId,
      userId,
      isActive: true,
      createdAt: fixedNow,
      updatedAt: fixedNow,
    } as any);

  it('debería crear una tiquetera con los datos correctos y guardar en el repositorio', async () => {
    gymMemberRepo.findByUserAndGym.mockResolvedValue(fakeMember());

    // el repo guarda el pack tal cual lo recibe
    ticketPackRepo.save.mockImplementation(async (pack: TicketPack) => pack);

    const input = baseInput();

    const result = await createTicketPack(deps(), input as any);

    expect(gymMemberRepo.findByUserAndGym).toHaveBeenCalledTimes(1);
    expect(gymMemberRepo.findByUserAndGym).toHaveBeenCalledWith(userId, gymId);

    expect(generateId).toHaveBeenCalledTimes(1);

    expect(ticketPackRepo.save).toHaveBeenCalledTimes(1);
    const savedArg = ticketPackRepo.save.mock.calls[0][0] as TicketPack;

    // id generado por generateId
    expect(savedArg.id).toBe(generatedId);

    // Gym y usuario correctos
    expect(savedArg.gymId).toBe(gymId);
    expect(savedArg.userId).toBe(userId);

    // Nombre y créditos
    expect(savedArg.name).toBe(input.name);
    expect(savedArg.totalCredits).toBe(input.totalCredits);

    // remainingCredits debe inicializarse igual a totalCredits
    expect(savedArg.remainingCredits).toBe(input.totalCredits);

    // estado inicial debe ser ACTIVE
    expect(savedArg.status).toBe<'ACTIVE' | TicketPackStatus>('ACTIVE');

    // expiración
    expect(savedArg.expiresAt).toBe(input.expiresAt);

    // timestamps
    expect(savedArg.createdAt).toEqual(fixedNow);
    expect(savedArg.updatedAt).toEqual(fixedNow);

    // el resultado del caso de uso debe ser el mismo pack creado
    expect(result).toMatchObject({
      id: generatedId,
      gymId,
      userId,
      name: input.name,
      totalCredits: input.totalCredits,
      remainingCredits: input.totalCredits,
      status: 'ACTIVE',
    });
  });

  it('debería permitir configurar expiresAt cuando se envía en el input', async () => {
    gymMemberRepo.findByUserAndGym.mockResolvedValue(fakeMember());

    ticketPackRepo.save.mockImplementation(async (pack: TicketPack) => pack);

    const customExpires = new Date('2025-06-01T00:00:00.000Z');

    const input = {
      ...baseInput(),
      expiresAt: customExpires,
    };

    const result = await createTicketPack(deps(), input as any);

    const savedArg = ticketPackRepo.save.mock.calls[0][0] as TicketPack;

    expect(savedArg.expiresAt).toEqual(customExpires);
    expect(result.expiresAt).toEqual(customExpires);
  });
});
