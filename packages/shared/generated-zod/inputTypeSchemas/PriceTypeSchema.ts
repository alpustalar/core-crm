import { z } from 'zod';

export const PriceTypeSchema = z.enum(['PURCHASE','SALE']);

export type PriceTypeType = `${z.infer<typeof PriceTypeSchema>}`

export default PriceTypeSchema;
