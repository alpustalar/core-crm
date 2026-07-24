import { createZodDto } from 'nestjs-zod';
import { GetPurchaseRequestsSchema } from '../../schemas/queries';

export class GetPurchaseRequestsFilterDto extends createZodDto(
  GetPurchaseRequestsSchema
) {}
