import { ProductConditionType as ProductCondition } from '@input-type-schemas/ProductConditionSchema';
import { ProductUnitType as ProductUnit } from '@input-type-schemas/ProductUnitSchema';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';

export interface CreateProductProps {
  id: string;
  name: string;
  stockCode: string;
  barcode?: string | null;
  brand?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  unit: ProductUnit;
  condition?: ProductCondition;
  vatRate?: VatRate;
  criticalStockQty?: Quantity;
  reorderQty?: Quantity;
  organizationId: string;
  categoryId?: string | null;
  supplierId?: string | null;
}
