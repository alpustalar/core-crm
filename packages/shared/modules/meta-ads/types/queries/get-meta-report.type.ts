import { z } from 'zod';
import { GetMetaReportSchema } from '../../schemas/queries';

export type GetMetaReport = z.infer<typeof GetMetaReportSchema>;
