import { z } from 'zod';
import { UpdateEmployeeSchema } from '../../schemas/commands';

export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
