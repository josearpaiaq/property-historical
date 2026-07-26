import { IsString, IsOptional, IsIn, IsDateString, IsNumberString } from 'class-validator';
import { eventCategoryEnum, EventCategory, eventStatusEnum, EventStatus } from '../../database/schema/events';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumberString()
  cost?: string;

  @IsOptional()
  @IsIn(eventCategoryEnum)
  category?: EventCategory;

  @IsOptional()
  @IsIn(eventStatusEnum)
  status?: EventStatus;
}
