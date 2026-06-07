import { z } from 'zod';
import { ResourceTypeSchema } from '../inputTypeSchemas/ResourceTypeSchema'

/////////////////////////////////////////
// RESOURCE SCHEMA
/////////////////////////////////////////

export const ResourceSchema = z.object({
  type: ResourceTypeSchema,
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  clinicId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Resource = z.infer<typeof ResourceSchema>

export default ResourceSchema;
