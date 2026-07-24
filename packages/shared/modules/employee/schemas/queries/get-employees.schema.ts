import { z } from 'zod';
import EmployeeStatusSchema from '@shared/generated-zod/inputTypeSchemas/EmployeeStatusSchema';

export const GetEmployeesSchema = z.object({
  status: EmployeeStatusSchema.optional(),
});

export type GetEmployeesFilter = z.infer<typeof GetEmployeesSchema>;
