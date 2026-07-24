import { z } from 'zod';
import {
  GetCashRegistersSchema,
  GetCashSessionsSchema,
} from '../../schemas/queries';

export type GetCashRegisters = z.infer<typeof GetCashRegistersSchema>;
export type GetCashSessions = z.infer<typeof GetCashSessionsSchema>;
