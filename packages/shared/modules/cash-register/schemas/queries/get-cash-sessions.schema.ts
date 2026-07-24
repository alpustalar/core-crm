import { z } from 'zod';
import CashSessionStatusSchema from '@shared/generated-zod/inputTypeSchemas/CashSessionStatusSchema';

export const GetCashSessionsSchema = z.object({
  cashRegisterId: z.uuid().optional(),
  status: CashSessionStatusSchema.optional(),
});
