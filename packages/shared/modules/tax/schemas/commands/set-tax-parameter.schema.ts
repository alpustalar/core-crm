import { z } from 'zod';

export const TaxParameterKeyEnum = z.enum([
  'VAT_HEALTH',
  'VAT_STANDARD',
  'VAT_REDUCED',
  'WHT_SELF_EMPLOYMENT',
  'WHT_RENT',
  'CORP_TAX',
]);

export const SetTaxParameterSchema = z.object({
  key: TaxParameterKeyEnum,
  rate: z.number().min(0).max(100),
  /** Yürürlük başlangıcı; verilmezse şimdi alınır. */
  validFrom: z.coerce.date().optional(),
});
