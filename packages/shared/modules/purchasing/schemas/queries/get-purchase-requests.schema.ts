import { z } from 'zod';
import PurchaseRequestStatusSchema from '@shared/generated-zod/inputTypeSchemas/PurchaseRequestStatusSchema';

export const GetPurchaseRequestsSchema = z.object({
  status: PurchaseRequestStatusSchema.optional(),
});
