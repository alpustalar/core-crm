import { createZodDto } from 'nestjs-zod';
import { SendWorkOrderSchema } from '../../schemas/commands';

export class SendWorkOrderDto extends createZodDto(SendWorkOrderSchema) {}
