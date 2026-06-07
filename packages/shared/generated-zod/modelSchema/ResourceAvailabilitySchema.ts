import { z } from 'zod';

/////////////////////////////////////////
// RESOURCE AVAILABILITY SCHEMA
/////////////////////////////////////////

export const ResourceAvailabilitySchema = z.object({
  id: z.uuid(),
  dayOfWeek: z.number().int(),
  startMinute: z.number().int(),
  endMinute: z.number().int(),
  isClosed: z.boolean(),
  resourceId: z.string(),
})

export type ResourceAvailability = z.infer<typeof ResourceAvailabilitySchema>

export default ResourceAvailabilitySchema;
