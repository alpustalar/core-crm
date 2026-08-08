import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { PlanIdSchema } from '../inputTypeSchemas/PlanIdSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// PLAN SCHEMA
/////////////////////////////////////////

/**
 * Plan tanımı — sabit PlanId'ye bağlı, admin-düzenlenebilir fiyat + modül bundle.
 * PlanId enum sabittir (yeni plan eklenmez); Plan satırı fiyat/isim/modülleri taşır.
 */
export const PlanSchema = z.object({
  planId: PlanIdSchema,
  currency: CurrencySchema,
  id: z.string(),
  name: z.string(),
  monthlyPrice: decimalSchema("Field 'monthlyPrice' must be a Decimal. Location: ['Models', 'Plan']"),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Plan = z.infer<typeof PlanSchema>

export default PlanSchema;
