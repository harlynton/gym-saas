"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumeTicketCreditError = void 0;
exports.consumeTicketCredit = consumeTicketCredit;
class ConsumeTicketCreditError extends Error {
    code;
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
    }
}
exports.ConsumeTicketCreditError = ConsumeTicketCreditError;
async function consumeTicketCredit(deps, input) {
    const { ticketPackRepo, now } = deps;
    const { gymId, userId, ticketPackId } = input;
    const pack = await ticketPackRepo.findById(ticketPackId);
    if (!pack) {
        throw new ConsumeTicketCreditError('TICKET_PACK_NOT_FOUND', 'Ticket pack not found');
    }
    if (pack.gymId !== gymId) {
        throw new ConsumeTicketCreditError('TICKET_PACK_NOT_IN_GYM', 'Ticket pack does not belong to this gym');
    }
    if (pack.userId !== userId) {
        throw new ConsumeTicketCreditError('TICKET_PACK_NOT_OWNED_BY_USER', 'Ticket pack does not belong to this user');
    }
    if (pack.status !== 'ACTIVE') {
        throw new ConsumeTicketCreditError('TICKET_PACK_NOT_ACTIVE', 'Ticket pack is not active');
    }
    const nowDate = now();
    if (pack.expiresAt && pack.expiresAt.getTime() < nowDate.getTime()) {
        const updated = {
            ...pack,
            status: 'EXPIRED',
            updatedAt: nowDate,
        };
        await ticketPackRepo.save(updated);
        throw new ConsumeTicketCreditError('TICKET_PACK_EXPIRED', 'Ticket pack has expired');
    }
    if (pack.remainingCredits <= 0) {
        throw new ConsumeTicketCreditError('NO_REMAINING_CREDITS', 'Ticket pack has no remaining credits');
    }
    const updatedRemaining = pack.remainingCredits - 1;
    let newStatus = pack.status;
    if (updatedRemaining === 0) {
        newStatus = 'USED_UP';
    }
    const updatedPack = {
        ...pack,
        remainingCredits: updatedRemaining,
        status: newStatus,
        updatedAt: nowDate,
    };
    const saved = await ticketPackRepo.save(updatedPack);
    return saved;
}
//# sourceMappingURL=consume-ticket-credit.js.map