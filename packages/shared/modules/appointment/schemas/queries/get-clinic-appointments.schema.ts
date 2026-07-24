import { z } from 'zod';
import { AppointmentStatusSchema } from '@shared/generated-zod/inputTypeSchemas/AppointmentStatusSchema';

export const GetClinicAppointmentsSchema = z.object({
  clinicId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  providerId: z.uuid().optional(),
  status: z.enum(AppointmentStatusSchema.enum).optional(),
});
