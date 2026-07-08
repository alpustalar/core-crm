import { z } from 'zod';

/////////////////////////////////////////
// CLINIC AVAILABILITY SCHEMA
/////////////////////////////////////////

export const ClinicAvailabilitySchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  dayOfWeek: z.number().int(),
  startMinute: z.number().int(),
  endMinute: z.number().int(),
  isClosed: z.boolean(),
})

export type ClinicAvailability = z.infer<typeof ClinicAvailabilitySchema>

export default ClinicAvailabilitySchema;
