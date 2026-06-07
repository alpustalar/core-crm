import { z } from 'zod';

export const ProductConditionSchema = z.enum(['NEW','USED']);

export type ProductConditionType = `${z.infer<typeof ProductConditionSchema>}`

export default ProductConditionSchema;
