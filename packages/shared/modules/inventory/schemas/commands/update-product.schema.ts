import { z } from 'zod';
import { ProductUnitSchema } from './create-product.schema';

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  barcode: z.string().max(50).optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  unit: ProductUnitSchema.optional(),
  vatRate: z.number().min(0).max(100).optional(),
  criticalStockQty: z.number().min(0).optional(),
  reorderQty: z.number().min(0).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
});
