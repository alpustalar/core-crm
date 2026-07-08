import { z } from 'zod';
import { GlobalStatusSchema } from '../inputTypeSchemas/GlobalStatusSchema'
import { TimeZoneSchema } from '../inputTypeSchemas/TimeZoneSchema'

/////////////////////////////////////////
// ORGANIZATION SCHEMA
/////////////////////////////////////////

export const OrganizationSchema = z.object({
  status: GlobalStatusSchema,
  timezone: TimeZoneSchema,
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  district: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Organization = z.infer<typeof OrganizationSchema>

export default OrganizationSchema;
