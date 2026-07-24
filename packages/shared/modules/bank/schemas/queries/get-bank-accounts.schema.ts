import { z } from 'zod';
import BankAccountStatusSchema from '@shared/generated-zod/inputTypeSchemas/BankAccountStatusSchema';

export const GetBankAccountsSchema = z.object({
  status: BankAccountStatusSchema.optional(),
});
