import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;
}
