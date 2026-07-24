import { GetClinicCalendarSchema } from '@shared/modules/appointment/schemas/queries/get-clinic-calendar.schema';
import { createZodDto } from 'nestjs-zod';

export class GetClinicCalendarDto extends createZodDto(
  GetClinicCalendarSchema
) {}
