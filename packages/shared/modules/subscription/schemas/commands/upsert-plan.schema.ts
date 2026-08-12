import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';
import PlanIdSchema from '@shared/generated-zod/inputTypeSchemas/PlanIdSchema';

/** Plan fiyat/ad tanımı. `planId` sabit katalog anahtarıdır (yeni plan eklenmez). */
export const UpsertPlanSchema = z.object({
  planId: PlanIdSchema,
  name: z.string().min(1),
  monthlyPrice: z.coerce.number().nonnegative(),
  currency: CurrencySchema,
});
