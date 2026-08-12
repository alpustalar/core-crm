import { z } from 'zod';
import { AddEmployeeContractSchema } from '../../schemas/commands';

export type AddEmployeeContract = z.infer<typeof AddEmployeeContractSchema>;
