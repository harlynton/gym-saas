export class CreateTicketPackBodyDto {
  userId!: string;
  name!: string;
  totalCredits!: number;

  priceAmount!: number;
  priceCurrency!: string;

  // opcional
  expiresAt?: string;
}
