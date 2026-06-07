import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['CASH','CREDIT_CARD','BANK_TRANSFER','EFT','MAIL_ORDER','CHEQUE','BOND']);

export type PaymentMethodType = `${z.infer<typeof PaymentMethodSchema>}`

export default PaymentMethodSchema;
