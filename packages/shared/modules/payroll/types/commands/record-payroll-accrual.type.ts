import { z } from 'zod';
import { RecordPayrollAccrualSchema } from '../../schemas/commands';

export type RecordPayrollAccrual = z.infer<typeof RecordPayrollAccrualSchema>;
