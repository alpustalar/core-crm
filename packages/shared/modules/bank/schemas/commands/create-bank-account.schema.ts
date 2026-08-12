import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

/** Yeni banka hesabı oluşturma. */
export const CreateBankAccountSchema = z.object({
  name: z.string().min(1),
  bankName: z.string().min(1),
  iban: z.string().nullable().optional(),
  accountNo: z.string().nullable().optional(),
  currency: CurrencySchema.optional(),
  openingBalance: z.number().optional(),
  clinicId: z.string(),
  organizationId: z.string().nullable().optional(),
});
