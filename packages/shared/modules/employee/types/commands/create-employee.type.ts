import { z } from 'zod';
import { CreateEmployeeSchema } from '../../schemas/commands';

export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
