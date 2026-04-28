import { z } from 'zod';

/////////////////////////////////////////
// PROVIDER AVAILABILITY SCHEMA
/////////////////////////////////////////

export const ProviderAvailabilitySchema = z.object({
  id: z.uuid(),
  dayOfWeek: z.number().int(),
  startMinute: z.number().int(),
  endMinute: z.number().int(),
  breakStartMinute: z.number().int().nullable(),
  breakEndMinute: z.number().int().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  providerId: z.string(),
})

export type ProviderAvailability = z.infer<typeof ProviderAvailabilitySchema>

export default ProviderAvailabilitySchema;
