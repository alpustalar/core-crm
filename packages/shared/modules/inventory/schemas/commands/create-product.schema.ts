import { z } from 'zod';

const ProductUnitSchema = z.enum([
  'PIECE', 'ML', 'GR', 'KG', 'LITER', 'BOX', 'AMPULE', 'VIAL', 'BOTTLE', 'TUBE',
]);

const ProductConditionSchema = z.enum(['NEW', 'USED']);

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  stockCode: z.string().min(1).max(50),
  barcode: z.string().max(50).optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  unit: ProductUnitSchema,
  condition: ProductConditionSchema.optional(),
  vatRate: z.number().min(0).max(100).optional(),
  criticalStockQty: z.number().min(0).optional(),
  reorderQty: z.number().min(0).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
});
