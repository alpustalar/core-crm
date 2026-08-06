import { createZodDto } from 'nestjs-zod';
import { CancelWorkOrderSchema } from '../../schemas/commands';

export class CancelWorkOrderDto extends createZodDto(CancelWorkOrderSchema) {}
