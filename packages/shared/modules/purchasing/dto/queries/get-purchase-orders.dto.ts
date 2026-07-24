import { createZodDto } from 'nestjs-zod';
import { GetPurchaseOrdersSchema } from '../../schemas/queries';

export class GetPurchaseOrdersFilterDto extends createZodDto(
  GetPurchaseOrdersSchema
) {}
