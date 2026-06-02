import { z } from 'zod';

export const LedgerCategorySchema = z.enum(['TREATMENT_PAYMENT','REFUND','MATERIAL_PURCHASE','SALARY','RENT','OTHER']);

export type LedgerCategoryType = `${z.infer<typeof LedgerCategorySchema>}`

export default LedgerCategorySchema;
