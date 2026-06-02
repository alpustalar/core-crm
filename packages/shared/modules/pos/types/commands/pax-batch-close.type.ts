import { z } from 'zod';
import { PaxBatchCloseSchema } from '../../schemas/commands';

export type PaxBatchClose = z.infer<typeof PaxBatchCloseSchema>;
