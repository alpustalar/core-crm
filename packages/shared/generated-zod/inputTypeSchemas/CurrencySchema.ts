import { z } from 'zod';

export const CurrencySchema = z.enum(['TRY','USD','EUR','GBP']);

export type CurrencyType = `${z.infer<typeof CurrencySchema>}`

export default CurrencySchema;
