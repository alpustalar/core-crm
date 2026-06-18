import { ProductUnitType as ProductUnit } from '@input-type-schemas/ProductUnitSchema';
import { Decimal } from 'decimal.js';

export interface UpdateProductProps {
  name?: string;
  barcode?: string | null;
  brand?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  unit?: ProductUnit;
  vatRate?: Decimal;
  criticalStockQty?: Decimal;
  reorderQty?: Decimal;
  categoryId?: string | null;
  supplierId?: string | null;
}
