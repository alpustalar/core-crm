import { createZodDto } from 'nestjs-zod';
import { CreateExternalWorkOrderSchema } from '../../schemas/commands';

export class CreateExternalWorkOrderDto extends createZodDto(
  CreateExternalWorkOrderSchema
) {}
