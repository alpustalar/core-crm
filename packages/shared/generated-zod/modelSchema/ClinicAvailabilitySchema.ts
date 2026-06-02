import { z } from 'zod';

/////////////////////////////////////////
// CLINIC AVAILABILITY SCHEMA
/////////////////////////////////////////

export const ClinicAvailabilitySchema = z.object({
  id: z.uuid(),
  dayOfWeek: z.number().int(),
  startMinute: z.number().int(),
  endMinute: z.number().int(),
  isClosed: z.boolean(),
  clinicId: z.string(),
})

export type ClinicAvailability = z.infer<typeof ClinicAvailabilitySchema>

export default ClinicAvailabilitySchema;
