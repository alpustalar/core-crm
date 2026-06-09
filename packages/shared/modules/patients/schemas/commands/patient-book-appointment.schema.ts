import { z } from 'zod';

export const PatientBookAppointmentSchema = z.object({
  idToken: z.string().min(1),
  firstName: z.string().min(1),
  organizationId: z.string().uuid(),
  clinicId: z.string().uuid(),
  providerId: z.string().uuid(),
  startTime: z.coerce.date(),
  duration: z.number().positive().optional(),
  endTime: z.coerce.date().optional(),
  treatmentId: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});
