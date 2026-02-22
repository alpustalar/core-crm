import { z } from 'zod';

/////////////////////////////////////////
// ROLE CAPABILITY SCHEMA
/////////////////////////////////////////

export const RoleCapabilitySchema = z.object({
  id: z.uuid(),
  roleId: z.string(),
  capabilityId: z.string(),
  createdAt: z.coerce.date(),
})

export type RoleCapability = z.infer<typeof RoleCapabilitySchema>

export default RoleCapabilitySchema;
