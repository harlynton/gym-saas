import { IsString, IsOptional, IsISO8601 } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  userId!: string;

  @IsString()
  membershipPlanId!: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string; // ISO string
}
