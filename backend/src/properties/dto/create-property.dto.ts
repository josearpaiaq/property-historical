import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';
import { propertyTypeEnum, PropertyType } from '../../database/schema/properties';

export class CreatePropertyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsIn(propertyTypeEnum)
  type?: PropertyType;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
