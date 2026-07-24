import { createZodDto } from 'nestjs-zod';
import { GetClinicDailySummarySchema } from '@shared/modules/appointment/schemas/queries/get-clinic-daily-summary.schema';

export class GetClinicDailySummaryDto extends createZodDto(
  GetClinicDailySummarySchema
) {}
