import { z } from 'zod';
import { TerminateEmployeeSchema } from '../../schemas/commands';

export type TerminateEmployee = z.infer<typeof TerminateEmployeeSchema>;
