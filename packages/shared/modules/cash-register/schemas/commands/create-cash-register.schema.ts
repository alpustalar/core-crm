import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

/** Yeni kasa oluşturma. */
export const CreateCashRegisterSchema = z.object({
  name: z.string().min(1),
  currency: CurrencySchema.optional(),
});
