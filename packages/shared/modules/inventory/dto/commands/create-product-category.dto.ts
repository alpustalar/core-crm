import { createZodDto } from 'nestjs-zod';
import { CreateProductCategorySchema } from '../../schemas/commands';

export class CreateProductCategoryDto extends createZodDto(
  CreateProductCategorySchema
) {}
