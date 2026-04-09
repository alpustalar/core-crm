import { z } from 'zod';

/////////////////////////////////////////
// CAPABILITY SCHEMA
/////////////////////////////////////////

export const CapabilitySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  module: z.string(),
  action: z.string(),
})

export type Capability = z.infer<typeof CapabilitySchema>

export default CapabilitySchema;
