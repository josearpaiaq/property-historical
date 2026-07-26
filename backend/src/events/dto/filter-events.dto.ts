import { IsOptional, IsIn, IsDateString, IsString, IsNumberString } from 'class-validator';
import { eventCategoryEnum, EventCategory, eventStatusEnum, EventStatus } from '../../database/schema/events';

export class FilterEventsDto {
  @IsOptional()
  @IsIn(eventCategoryEnum)
  category?: EventCategory;

  @IsOptional()
  @IsIn(eventStatusEnum)
  status?: EventStatus;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsNumberString()
  costMin?: string;

  @IsOptional()
  @IsNumberString()
  costMax?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
