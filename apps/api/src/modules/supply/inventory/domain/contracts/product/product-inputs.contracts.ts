import type { ProductConditionType } from '@input-type-schemas/ProductConditionSchema';
import type { ProductUnitType } from '@input-type-schemas/ProductUnitSchema';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import type { ProductBatch } from '@modules/supply/inventory/domain/entities/product-batch.entity';

/** Props for creating a new Product. */
export interface CreateProductProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  /** Product name (required). */
  name: string;
  /** Stock code (required). */
  stockCode: string;
  /** Barcode for inventory tracking. */
  barcode?: string | null;
  /** Product brand. */
  brand?: string | null;
  /** Detailed description. */
  description?: string | null;
  /** Product image URL. */
  imageUrl?: string | null;
  /** Unit of measurement (required). */
  unit: ProductUnitType;
  /** Product condition/state (e.g., NEW, USED). */
  condition?: ProductConditionType;
  /** VAT rate — can be VatRate VO or raw percentage number. */
  vatRate: VatRate | number;
  /** Critical stock quantity threshold. */
  criticalStockQty: Quantity | number;
  /** Quantity to reorder when stok falls below critical. */
  reorderQty: Quantity | number;
  /** Clinic ID (required). */
  clinicId: string;
  /** Organization ID (required). */
  organizationId: string;
  /** Product category ID. */
  categoryId?: string | null;
  /** Primary supplier ID. */
  supplierId?: string | null;
}

/** Props for updating an existing Product. */
export interface UpdateProductProps {
  /** Product name. */
  name?: string;
  /** Barcode for inventory tracking. */
  barcode?: string | null;
  /** Product brand. */
  brand?: string | null;
  /** Detailed description. */
  description?: string | null;
  /** Product image URL. */
  imageUrl?: string | null;
  /** Product condition/state. */
  condition?: ProductConditionType;
  /** Unit of measurement. */
  unit?: ProductUnitType;
  /** VAT rate (raw percentage). */
  vatRate?: number;
  /** Critical stock quantity threshold. */
  criticalStockQty?: number;
  /** Quantity to reorder. */
  reorderQty?: number;
  /** Product category ID. */
  categoryId?: string | null;
  /** Primary supplier ID. */
  supplierId?: string | null;
}

/** Props for stock quantity change (in or out). */
export interface HandleStockChangeProps {
  /** Quantity delta (positive = in, negative = out) — number or Decimal. */
  quantityDelta: number | import('decimal.js').Decimal;
  /** Clinic where change occurs. */
  clinicId: string;
  /** Available product batches to allocate from/to. */
  availableBatches: ProductBatch[];
  /** If specified, use only this batch. */
  explicitBatchId?: string | null;
  /** User ID performing the change. */
  performedById: string;
  /** Optional note for audit trail. */
  notes?: string | null;
}
