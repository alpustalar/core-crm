import { createZodDto } from 'nestjs-zod';
import { UpdateChargeDiscountSchema } from '../../schemas/commands';

export class UpdateChargeDiscountDto extends createZodDto(
  UpdateChargeDiscountSchema
) {}
