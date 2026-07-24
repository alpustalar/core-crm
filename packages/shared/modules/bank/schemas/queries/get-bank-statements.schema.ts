import { z } from 'zod';

export const GetBankStatementsSchema = z.object({
  bankAccountId: z.uuid().optional(),
});
