"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTicketPackError = void 0;
exports.createTicketPack = createTicketPack;
class CreateTicketPackError extends Error {
    code;
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
    }
}
exports.CreateTicketPackError = CreateTicketPackError;
async function createTicketPack(deps, input) {
    const { ticketPackRepo, gymMemberRepo, generateId, now } = deps;
    const { gymId, userId, name, totalCredits, price } = input;
    if (totalCredits <= 0) {
        throw new CreateTicketPackError('INVALID_TOTAL_CREDITS', 'Ticket pack must have at least 1 credit');
    }
    const member = await gymMemberRepo.findByUserAndGym(userId, gymId);
    if (!member) {
        throw new CreateTicketPackError('USER_NOT_MEMBER_OF_GYM', 'User is not a member of this gym');
    }
    if (!member.isActive) {
        throw new CreateTicketPackError('USER_NOT_ACTIVE_MEMBER', 'User is not an active member of this gym');
    }
    let expiresAt = input.expiresAt ?? null;
    if (!expiresAt && input.validDays && input.validDays > 0) {
        const start = input.startDate ?? now();
        const end = new Date(start.getTime());
        end.setDate(end.getDate() + input.validDays);
        expiresAt = end;
    }
    const createdAt = now();
    const pack = {
        id: generateId(),
        gymId,
        userId,
        name,
        totalCredits,
        remainingCredits: totalCredits,
        expiresAt,
        price,
        status: 'ACTIVE',
        createdAt,
        updatedAt: createdAt,
    };
    const saved = await ticketPackRepo.save(pack);
    return saved;
}
//# sourceMappingURL=create-ticket-pack.js.map