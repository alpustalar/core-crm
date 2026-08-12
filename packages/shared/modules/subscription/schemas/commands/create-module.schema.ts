import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

/** Yeni satın alınabilir eklenti modülü (platform kataloğu). */
export const CreateModuleSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  monthlyPrice: z.coerce.number().nonnegative(),
  currency: CurrencySchema,
  description: z.string().nullable().optional(),
});
