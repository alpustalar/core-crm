import { z } from 'zod';
import PurchaseOrderStatusSchema from '@shared/generated-zod/inputTypeSchemas/PurchaseOrderStatusSchema';
import PurchaseOrderBillingStatusSchema from '@shared/generated-zod/inputTypeSchemas/PurchaseOrderBillingStatusSchema';

export const GetPurchaseOrdersSchema = z.object({
  status: PurchaseOrderStatusSchema.optional(),
  supplierId: z.uuid().optional(),
  /** Fatura eşleştirme durumu — "faturası gelmemiş siparişler" listesi için. */
  billingStatus: PurchaseOrderBillingStatusSchema.optional(),
});
