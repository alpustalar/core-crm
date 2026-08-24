import { ProductBatch, Pagination } from '@shared';
import { Decimal } from 'decimal.js';

/** Filter for finding product batches. */
export interface FindBatchFilter {
  productId: string;
  clinicId: string;
  /** Include expired batches. */
  includeExpired?: boolean;
  /** Include sold-out batches. */
  includeSoldOut?: boolean;
}

/** Product batch read-model for query responses. */
export type ProductBatchResponse = ProductBatch;

/** Paginated batch results. */
export interface BatchPage {
  items: ProductBatchResponse[];
  total: number;
  pagination: Pagination;
}

/** Available inventory snapshot (quantity and expiry). */
export interface AvailableInventory {
  batchId: string;
  productId: string;
  quantity: Decimal | number;
  expiresAt: Date | null;
  lotNumber: string | null;
}
