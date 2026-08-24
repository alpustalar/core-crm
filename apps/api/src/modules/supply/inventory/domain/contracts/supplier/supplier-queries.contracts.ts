import { Supplier } from '@shared';
import { Pagination } from '@shared/common/pagination';

/** Filter for finding suppliers. */
export interface FindSupplierFilter {
  organizationId: string;
  clinicId?: string;
  search?: string;
}

/** Supplier read-model for query responses. */
export type SupplierResponse = Supplier;

/** Paginated supplier results. */
export interface SupplierPage {
  items: SupplierResponse[];
  total: number;
  pagination: Pagination;
}
