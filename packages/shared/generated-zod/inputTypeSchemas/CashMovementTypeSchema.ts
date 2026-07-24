import { z } from 'zod';

export const CashMovementTypeSchema = z.enum(['OPENING_FLOAT','SALE_COLLECTION','REFUND_PAYOUT','EXPENSE','CASH_IN','CASH_OUT','BANK_DEPOSIT']);

export type CashMovementTypeType = `${z.infer<typeof CashMovementTypeSchema>}`

export default CashMovementTypeSchema;
