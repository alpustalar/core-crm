import { createZodDto } from 'nestjs-zod';
import { FindProductsSchema } from '../../schemas/queries';

export class FindProductsDto extends createZodDto(FindProductsSchema) {}
