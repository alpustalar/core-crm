import { createZodDto } from 'nestjs-zod';
import { PaginationSchema } from '@shared/common/pagination/pagination.schema';

export class PaginationDto extends createZodDto(PaginationSchema) {}
