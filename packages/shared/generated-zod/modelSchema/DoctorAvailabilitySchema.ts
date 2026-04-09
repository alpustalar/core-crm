import { z } from 'zod';

/////////////////////////////////////////
// DOCTOR AVAILABILITY SCHEMA
/////////////////////////////////////////

export const DoctorAvailabilitySchema = z.object({
  id: z.uuid(),
  dayOfWeek: z.number().int(),
  startMinute: z.number().int(),
  endMinute: z.number().int(),
  breakStartMinute: z.number().int().nullable(),
  breakEndMinute: z.number().int().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  doctorId: z.string(),
})

export type DoctorAvailability = z.infer<typeof DoctorAvailabilitySchema>

export default DoctorAvailabilitySchema;
