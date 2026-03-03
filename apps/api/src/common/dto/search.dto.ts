import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDto {
  @IsString()
  @Type(() => String)
  @IsOptional()
  search?: string;
}
