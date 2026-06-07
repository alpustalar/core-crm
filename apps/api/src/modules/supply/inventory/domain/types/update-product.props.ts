import { ProductUnit } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface UpdateProductProps {
  name?: string;
  barcode?: string | null;
  brand?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  unit?: ProductUnit;
  vatRate?: Prisma.Decimal;
  criticalStockQty?: Prisma.Decimal;
  reorderQty?: Prisma.Decimal;
  categoryId?: string | null;
  supplierId?: string | null;
}
