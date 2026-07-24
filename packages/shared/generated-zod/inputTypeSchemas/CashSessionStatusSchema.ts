import { z } from 'zod';

export const CashSessionStatusSchema = z.enum(['OPEN','CLOSED']);

export type CashSessionStatusType = `${z.infer<typeof CashSessionStatusSchema>}`

export default CashSessionStatusSchema;
