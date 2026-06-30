import { z } from 'zod';
import TimeZoneSchema from '@shared/generated-zod/inputTypeSchemas/TimeZoneSchema';


export const PatientBookAppointmentSchema = z.object({
  idToken: z.string().min(1),
  firstName: z.string().min(1),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  providerId: z.uuid(),
  startTime: z.coerce.date(),
  duration: z.number().positive().optional(),
  endTime: z.coerce.date().optional(),
  treatmentId: z.uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  isConsultation: z.boolean(),
  timezone: TimeZoneSchema.nullable().optional(),
});
