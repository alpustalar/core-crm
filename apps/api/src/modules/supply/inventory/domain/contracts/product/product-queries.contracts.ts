import { Product, Pagination } from '@shared';
import { Decimal } from 'decimal.js';

/** Filter for finding products. */
export interface FindProductFilter {
  clinicId: string;
  organizationId?: string;
  categoryId?: string;
  supplierId?: string;
  search?: string;
  /** Filter by condition (NEW, USED, etc.). */
  condition?: string;
  /** Include soft-deleted products. */
  includeSoftDeleted?: boolean;
}

/** Product read-model for query responses. */
export type ProductResponse = Product;

/** Paginated product results. */
export interface ProductPage {
  items: ProductResponse[];
  total: number;
  pagination: Pagination;
}

/** Low-stock alert. */
export interface LowStockAlert {
  productId: string;
  name: string;
  currentQuantity: Decimal | number;
  criticalQuantity: Decimal | number;
  reorderQuantity: Decimal | number;
}
