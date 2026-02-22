import { z } from 'zod';

/////////////////////////////////////////
// ROLE SCHEMA
/////////////////////////////////////////

export const RoleSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  priority: z.number().int(),
  isSystemRole: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Role = z.infer<typeof RoleSchema>

export default RoleSchema;
