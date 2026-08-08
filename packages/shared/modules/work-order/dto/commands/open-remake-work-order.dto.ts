import { createZodDto } from 'nestjs-zod';
import { OpenRemakeWorkOrderSchema } from '../../schemas/commands';

export class OpenRemakeWorkOrderDto extends createZodDto(
  OpenRemakeWorkOrderSchema
) {}
