import { z } from 'zod';
import {
  GetPurchaseRequestsSchema,
  GetPurchaseOrdersSchema,
} from '../../schemas/queries';

export type GetPurchaseRequests = z.infer<typeof GetPurchaseRequestsSchema>;
export type GetPurchaseOrders = z.infer<typeof GetPurchaseOrdersSchema>;
