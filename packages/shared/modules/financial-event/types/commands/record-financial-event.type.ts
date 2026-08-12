import { z } from 'zod';
import { RecordFinancialEventSchema } from '../../schemas/commands';

export type RecordFinancialEvent = z.infer<typeof RecordFinancialEventSchema>;
