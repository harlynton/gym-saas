import { IsInt, IsISO8601, IsOptional, IsString, Min } from 'class-validator';

export class CreateTicketPackDto {
  @IsString()
  userId!: string;

  @IsString()
  name!: string; // "10 clases spinning"

  @IsInt()
  @Min(1)
  totalCredits!: number;

  // Precio en centavos para evitar problemas de decimales
  @IsInt()
  @Min(0)
  amountCents!: number;

  @IsString()
  currency!: string; // "COP", "USD", etc.

  @IsOptional()
  @IsISO8601()
  expiresAt?: string; // ISO date string

  @IsOptional()
  @IsInt()
  @Min(1)
  validDays?: number; // alternativa a expiresAt
}
