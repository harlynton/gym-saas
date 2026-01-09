import { IsString, MinLength } from 'class-validator';

export class CreateGymDto {
  @IsString()
  @MinLength(3)
  name: string;
}
