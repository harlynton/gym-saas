import { consumeTicketCredit, ConsumeTicketCreditError } from './consume-ticket-credit';
import { TicketPackRepository } from '../repositories/ticket-pack-repository';
import { TicketPack } from '../entities/ticket-pack';
import { TicketPackStatus } from '../enums/ticket-pack-status';
import { GymId } from '../entities/gym';
import { UserId } from '../entities/user';
import { TicketPackId } from '../entities/ticket-pack';

describe('consumeTicketCredit', () => {
  const gymId: GymId = 'gym-1';
  const userId: UserId = 'user-1';
  const ticketPackId: TicketPackId = 'pack-1';

  const fixedNow = new Date('2025-01-01T10:00:00.000Z');

  let ticketPackRepo: jest.Mocked<TicketPackRepository>;

  const makePack = (overrides: Partial<TicketPack> = {}): TicketPack => ({
    id: ticketPackId,
    gymId,
    userId,
    name: '10 clases',
    totalCredits: 10,
    remainingCredits: 5,
    expiresAt: null,
    price: { amountCents: 100, currency: 'USD' },
    status: 'ACTIVE' as TicketPackStatus,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  });

  beforeEach(() => {
    ticketPackRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      // si tu interfaz tiene más métodos, puedes stubearlos también
    } as unknown as jest.Mocked<TicketPackRepository>;
  });

  const deps = () => ({
    ticketPackRepo,
    now: () => fixedNow,
  });

  const baseInput = () => ({
    gymId,
    userId,
    ticketPackId,
  });

  it('debería consumir un crédito correctamente cuando el pack está activo y tiene créditos', async () => {
    const pack = makePack({ remainingCredits: 3, status: 'ACTIVE' });
    ticketPackRepo.findById.mockResolvedValue(pack);
    ticketPackRepo.save.mockImplementation(async (p) => p);

    const result = await consumeTicketCredit(deps(), baseInput());

    expect(ticketPackRepo.findById).toHaveBeenCalledWith(ticketPackId);
    expect(ticketPackRepo.save).toHaveBeenCalledTimes(1);

    const savedArg = ticketPackRepo.save.mock.calls[0][0] as TicketPack;

    expect(savedArg.remainingCredits).toBe(2);
    expect(savedArg.status).toBe<'ACTIVE' | TicketPackStatus>('ACTIVE');
    expect(savedArg.updatedAt).toEqual(fixedNow);

    expect(result.remainingCredits).toBe(2);
    expect(result.status).toBe<'ACTIVE' | TicketPackStatus>('ACTIVE');
  });

  it('debería marcar el pack como USED_UP cuando se consume el último crédito', async () => {
    const pack = makePack({ remainingCredits: 1, status: 'ACTIVE' });
    ticketPackRepo.findById.mockResolvedValue(pack);
    ticketPackRepo.save.mockImplementation(async (p) => p);

    const result = await consumeTicketCredit(deps(), baseInput());

    const savedArg = ticketPackRepo.save.mock.calls[0][0] as TicketPack;

    expect(savedArg.remainingCredits).toBe(0);
    expect(savedArg.status).toBe<'USED_UP' | TicketPackStatus>('USED_UP');
    expect(result.status).toBe<'USED_UP' | TicketPackStatus>('USED_UP');
  });

  it('debería lanzar TICKET_PACK_NOT_FOUND cuando no se encuentra el pack', async () => {
    ticketPackRepo.findById.mockResolvedValue(null);

    await expect(consumeTicketCredit(deps(), baseInput())).rejects.toMatchObject({
      code: 'TICKET_PACK_NOT_FOUND',
    });
  });

  it('debería lanzar TICKET_PACK_NOT_IN_GYM cuando el pack pertenece a otro gym', async () => {
    const pack = makePack({ gymId: 'other-gym' as GymId });
    ticketPackRepo.findById.mockResolvedValue(pack);

    await expect(consumeTicketCredit(deps(), baseInput())).rejects.toMatchObject({
      code: 'TICKET_PACK_NOT_IN_GYM',
    });
  });

  it('debería lanzar TICKET_PACK_NOT_OWNED_BY_USER cuando el pack pertenece a otro usuario', async () => {
    const pack = makePack({ userId: 'other-user' as UserId });
    ticketPackRepo.findById.mockResolvedValue(pack);

    await expect(consumeTicketCredit(deps(), baseInput())).rejects.toMatchObject({
      code: 'TICKET_PACK_NOT_OWNED_BY_USER',
    });
  });

  it('debería lanzar TICKET_PACK_NOT_ACTIVE cuando el pack no está activo', async () => {
    const pack = makePack({ status: 'USED_UP' as TicketPackStatus });
    ticketPackRepo.findById.mockResolvedValue(pack);

    await expect(consumeTicketCredit(deps(), baseInput())).rejects.toMatchObject({
      code: 'TICKET_PACK_NOT_ACTIVE',
    });
  });

  it('debería marcar el pack como EXPIRED y lanzar TICKET_PACK_EXPIRED cuando está vencido', async () => {
    const expiredDate = new Date('2024-12-31T23:59:59.000Z');
    const pack = makePack({
      expiresAt: expiredDate,
      status: 'ACTIVE' as TicketPackStatus,
    });

    ticketPackRepo.findById.mockResolvedValue(pack);
    ticketPackRepo.save.mockImplementation(async (p) => p);

    await expect(consumeTicketCredit(deps(), baseInput())).rejects.toMatchObject({
      code: 'TICKET_PACK_EXPIRED',
    });

    expect(ticketPackRepo.save).toHaveBeenCalledTimes(1);
    const savedArg = ticketPackRepo.save.mock.calls[0][0] as TicketPack;

    expect(savedArg.status).toBe<'EXPIRED' | TicketPackStatus>('EXPIRED');
    expect(savedArg.updatedAt).toEqual(fixedNow);
  });

  it('debería lanzar NO_REMAINING_CREDITS cuando remainingCredits es 0', async () => {
    const pack = makePack({
      remainingCredits: 0,
      status: 'ACTIVE' as TicketPackStatus,
    });
    ticketPackRepo.findById.mockResolvedValue(pack);

    await expect(consumeTicketCredit(deps(), baseInput())).rejects.toMatchObject({
      code: 'NO_REMAINING_CREDITS',
    });

    // En este caso tu implementación NO actualiza el status a USED_UP,
    // solo lanza el error. Si quieres que lo haga, habría que ajustarlo.
  });
});
