import { z } from 'zod';
import EmploymentTypeSchema from '@shared/generated-zod/inputTypeSchemas/EmploymentTypeSchema';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

/** Yeni sözleşme (mevcut aktif sözleşme otomatik sonlandırılır). */
export const AddEmployeeContractSchema = z.object({
  type: EmploymentTypeSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  grossSalary: z.number().nonnegative(),
  currency: CurrencySchema.optional(),
});
