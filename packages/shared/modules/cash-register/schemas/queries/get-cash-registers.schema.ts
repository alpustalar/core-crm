import { z } from 'zod';
import CashRegisterStatusSchema from '@shared/generated-zod/inputTypeSchemas/CashRegisterStatusSchema';

export const GetCashRegistersSchema = z.object({
  status: CashRegisterStatusSchema.optional(),
});
