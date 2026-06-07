import { z } from 'zod';

/////////////////////////////////////////
// PRODUCT CATEGORY SCHEMA
/////////////////////////////////////////

export const ProductCategorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  organizationId: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductCategory = z.infer<typeof ProductCategorySchema>

export default ProductCategorySchema;
