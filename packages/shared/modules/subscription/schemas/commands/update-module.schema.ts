import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

/** Modül fiyat/durum güncellemesi. Anahtar (`key`) değişmez. */
export const UpdateModuleSchema = z.object({
  monthlyPrice: z.coerce.number().nonnegative().optional(),
  currency: CurrencySchema.optional(),
  isActive: z.boolean().optional(),
});
