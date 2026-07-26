import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  frequencyDays: number;

  @IsDateString()
  nextDueAt: string;
}
