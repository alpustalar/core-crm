import { z } from 'zod';

export const GetClinicAppointmentsSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
