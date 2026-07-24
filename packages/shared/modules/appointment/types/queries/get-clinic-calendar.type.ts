import { z } from 'zod';
import { GetClinicCalendarSchema } from '../../schemas/queries/get-clinic-calendar.schema';

export type GetClinicCalendar = z.infer<typeof GetClinicCalendarSchema>;
