import { z } from 'zod';
import { GetLedgerSummarySchema } from '../../schemas/queries';

export type GetLedgerSummary = z.infer<typeof GetLedgerSummarySchema>;
