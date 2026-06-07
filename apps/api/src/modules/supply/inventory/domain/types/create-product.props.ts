import { ProductCondition, ProductUnit } from '@prisma/client';
import { Prisma } from '@prisma/client';

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
  vatRate?: Prisma.Decimal;
  criticalStockQty?: Prisma.Decimal;
  reorderQty?: Prisma.Decimal;
  organizationId: string;
  categoryId?: string | null;
  supplierId?: string | null;
}
