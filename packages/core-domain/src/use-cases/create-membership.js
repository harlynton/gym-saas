"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMembershipError = void 0;
exports.createMembership = createMembership;
class CreateMembershipError extends Error {
    code;
    constructor(code, message) {
        super(message ?? code);
        this.code = code;
    }
}
exports.CreateMembershipError = CreateMembershipError;
async function createMembership(deps, input) {
    const { membershipPlanRepo, membershipRepo, gymMemberRepo, generateId, now } = deps;
    const { gymId, userId, membershipPlanId } = input;
    const plan = await membershipPlanRepo.findById(membershipPlanId);
    if (!plan) {
        throw new CreateMembershipError('PLAN_NOT_FOUND', 'Membership plan not found');
    }
    if (plan.gymId !== gymId) {
        throw new CreateMembershipError('PLAN_NOT_IN_GYM', 'Plan does not belong to this gym');
    }
    const gymMember = await gymMemberRepo.findByUserAndGym(userId, gymId);
    if (!gymMember || !gymMember.isActive) {
        throw new CreateMembershipError('USER_NOT_MEMBER_OF_GYM', 'User is not an active member of this gym');
    }
    const existing = await membershipRepo.findActiveByUserAndGym(userId, gymId);
    if (existing) {
        throw new CreateMembershipError('ACTIVE_MEMBERSHIP_EXISTS', 'User already has an active membership in this gym');
    }
    const start = input.startDate ?? now();
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + plan.durationDays);
    const period = {
        startDate: start,
        endDate: end,
    };
    const membership = {
        id: generateId(),
        gymId,
        userId,
        membershipPlanId,
        period,
        status: 'ACTIVE',
        createdAt: now(),
        updatedAt: now(),
    };
    const saved = await membershipRepo.save(membership);
    return saved;
}
//# sourceMappingURL=create-membership.js.map