import { IsString } from 'class-validator';

export class ConsumeTicketCreditDto {
  @IsString()
  userId!: string;
}
