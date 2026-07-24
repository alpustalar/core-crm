import { createZodDto } from 'nestjs-zod';
import { CreatePurchaseRequestSchema } from '../../schemas/commands';

export class CreatePurchaseRequestDto extends createZodDto(
  CreatePurchaseRequestSchema
) {}
