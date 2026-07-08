import { z } from 'zod';
import { ProductConditionSchema, ProductUnitSchema } from '@shared';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { Quantity } from '@src/domain/value-objects/quantity.vo';

export const CreateProductSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, 'Ürün adı zorunludur'),
  stockCode: z.string().min(1, 'Stok kodu zorunludur'),
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),

  unit: ProductUnitSchema, // Orijinal enum/tip şeması
  condition: ProductConditionSchema.optional(),

  vatRate: z.custom<VatRate | number>(
    (val) => val instanceof VatRate || typeof val === 'number'
  ),
  criticalStockQty: z.custom<Quantity | number>(
    (val) => val instanceof Quantity || typeof val === 'number'
  ),
  reorderQty: z.custom<Quantity | number>(
    (val) => val instanceof Quantity || typeof val === 'number'
  ),

  clinicId: z.uuid(),
  organizationId: z.uuid(),
  categoryId: z.uuid().nullable().optional(),
  supplierId: z.uuid().nullable().optional(),
});
export type CreateProductProps = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  condition: ProductConditionSchema.optional(),
  unit: ProductUnitSchema.optional(),

  vatRate: z.number().optional(),
  criticalStockQty: z.number().optional(),
  reorderQty: z.number().optional(),

  categoryId: z.uuid().nullable().optional(),
  supplierId: z.uuid().nullable().optional(),
});
export type UpdateProductProps = z.infer<typeof UpdateProductSchema>;
