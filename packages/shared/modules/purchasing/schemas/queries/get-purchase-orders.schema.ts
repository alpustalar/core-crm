import { z } from 'zod';
import PurchaseOrderStatusSchema from '@shared/generated-zod/inputTypeSchemas/PurchaseOrderStatusSchema';

export const GetPurchaseOrdersSchema = z.object({
  status: PurchaseOrderStatusSchema.optional(),
  supplierId: z.uuid().optional(),
});
