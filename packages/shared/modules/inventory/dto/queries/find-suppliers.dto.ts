import { createZodDto } from 'nestjs-zod';
import { FindSuppliersSchema } from '../../schemas/queries';

export class FindSuppliersDto extends createZodDto(FindSuppliersSchema) {}
