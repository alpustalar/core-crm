import { z } from 'zod';
import {
  CreatePurchaseRequestSchema,
  ReviewPurchaseRequestSchema,
  CreatePurchaseOrderSchema,
  ReceivePurchaseOrderSchema,
} from '../../schemas/commands';

export type CreatePurchaseRequest = z.infer<typeof CreatePurchaseRequestSchema>;
export type ReviewPurchaseRequest = z.infer<typeof ReviewPurchaseRequestSchema>;
export type CreatePurchaseOrder = z.infer<typeof CreatePurchaseOrderSchema>;
export type ReceivePurchaseOrder = z.infer<typeof ReceivePurchaseOrderSchema>;
