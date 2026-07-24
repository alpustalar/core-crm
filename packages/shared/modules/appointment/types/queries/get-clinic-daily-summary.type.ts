import { z } from 'zod';
import { GetClinicDailySummarySchema } from '../../schemas/queries/get-clinic-daily-summary.schema';

export type GetClinicDailySummary = z.infer<
  typeof GetClinicDailySummarySchema
>;
