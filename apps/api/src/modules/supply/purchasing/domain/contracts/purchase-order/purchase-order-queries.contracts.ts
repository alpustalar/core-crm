import { PurchaseOrder, Pagination } from '@shared';

/** Filter for finding purchase orders. */
export interface FindPurchaseOrdersFilter {
  clinicId: string;
  supplierId?: string;
  status?: string;
  billingStatus?: string;
  pagination: Pagination;
}

/** Purchase order with items. */
export type PurchaseOrderWithItems = any; // Infer from @shared if available

/** Paginated purchase order results. */
export interface PurchaseOrderPage {
  items: PurchaseOrderWithItems[];
  total: number;
  pagination: Pagination;
}
