import { IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationParamsDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsString()
  @Type(() => Number)
  @IsIn([5, 10, 30, 50, 100])
  limit?: number = 10;
}
