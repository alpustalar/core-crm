import { createZodDto } from 'nestjs-zod';
import { ReceiveWorkOrderSchema } from '../../schemas/commands';

export class ReceiveWorkOrderDto extends createZodDto(ReceiveWorkOrderSchema) {}
