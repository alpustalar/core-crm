import { createZodDto } from 'nestjs-zod';
import { CreatePurchaseOrderSchema } from '../../schemas/commands';

export class CreatePurchaseOrderDto extends createZodDto(
  CreatePurchaseOrderSchema
) {}
