import { z } from 'zod';
import { GetEmployeesSchema } from '../../schemas/queries';

export type GetEmployeesFilter = z.infer<typeof GetEmployeesSchema>;
