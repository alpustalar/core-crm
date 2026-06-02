import { createZodDto } from 'nestjs-zod';
import { CreateProductSchema } from '../../schemas/commands';

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
