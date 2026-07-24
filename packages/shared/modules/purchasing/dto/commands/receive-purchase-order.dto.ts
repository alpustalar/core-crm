import { createZodDto } from 'nestjs-zod';
import { ReceivePurchaseOrderSchema } from '../../schemas/commands';

export class ReceivePurchaseOrderDto extends createZodDto(
  ReceivePurchaseOrderSchema
) {}
