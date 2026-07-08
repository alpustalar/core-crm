import { z } from 'zod';

/////////////////////////////////////////
// PRODUCT CATEGORY SCHEMA
/////////////////////////////////////////

export const ProductCategorySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductCategory = z.infer<typeof ProductCategorySchema>

export default ProductCategorySchema;
