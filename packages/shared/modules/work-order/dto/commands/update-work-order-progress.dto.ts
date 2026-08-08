import { createZodDto } from 'nestjs-zod';
import { UpdateWorkOrderProgressSchema } from '../../schemas/commands';

export class UpdateWorkOrderProgressDto extends createZodDto(
  UpdateWorkOrderProgressSchema
) {}
