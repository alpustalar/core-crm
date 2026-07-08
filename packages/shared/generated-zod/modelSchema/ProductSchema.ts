import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { ProductUnitSchema } from '../inputTypeSchemas/ProductUnitSchema'
import { ProductConditionSchema } from '../inputTypeSchemas/ProductConditionSchema'

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

export const ProductSchema = z.object({
  unit: ProductUnitSchema,
  condition: ProductConditionSchema.nullable(),
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  categoryId: z.string().nullable(),
  supplierId: z.string().nullable(),
  name: z.string(),
  stockCode: z.string(),
  barcode: z.string().nullable(),
  brand: z.string().nullable(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  vatRate: z.instanceof(Prisma.Decimal, { message: "Field 'vatRate' must be a Decimal. Location: ['Models', 'Product']"}),
  criticalStockQty: z.instanceof(Prisma.Decimal, { message: "Field 'criticalStockQty' must be a Decimal. Location: ['Models', 'Product']"}),
  reorderQty: z.instanceof(Prisma.Decimal, { message: "Field 'reorderQty' must be a Decimal. Location: ['Models', 'Product']"}),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Product = z.infer<typeof ProductSchema>

export default ProductSchema;
