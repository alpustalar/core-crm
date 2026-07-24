import { z } from 'zod';

export const CashRegisterStatusSchema = z.enum(['ACTIVE','ARCHIVED']);

export type CashRegisterStatusType = `${z.infer<typeof CashRegisterStatusSchema>}`

export default CashRegisterStatusSchema;
