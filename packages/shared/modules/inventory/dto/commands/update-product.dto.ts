import { createZodDto } from 'nestjs-zod';
import { UpdateProductSchema } from '../../schemas/commands';

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
