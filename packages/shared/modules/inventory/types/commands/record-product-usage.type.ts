import { z } from 'zod';
import { RecordProductUsageSchema } from '../../schemas/commands';

export type RecordProductUsage = z.infer<typeof RecordProductUsageSchema>;
