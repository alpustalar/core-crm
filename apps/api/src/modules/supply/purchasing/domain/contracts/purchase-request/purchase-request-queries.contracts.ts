import { PurchaseRequest, Pagination } from '@shared';

/** Filter for finding purchase requests. */
export interface FindPurchaseRequestsFilter {
  clinicId: string;
  status?: string;
  pagination: Pagination;
}

/** Purchase request with items. */
export type PurchaseRequestWithItems = any; // Infer from @shared if available

/** Paginated purchase request results. */
export interface PurchaseRequestPage {
  items: PurchaseRequestWithItems[];
  total: number;
  pagination: Pagination;
}
