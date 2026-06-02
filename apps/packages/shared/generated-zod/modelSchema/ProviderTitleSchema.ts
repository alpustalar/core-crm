import { z } from 'zod';

/////////////////////////////////////////
// PROVIDER TITLE SCHEMA
/////////////////////////////////////////

export const ProviderTitleSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  sortOrder: z.number().int(),
})

export type ProviderTitle = z.infer<typeof ProviderTitleSchema>

export default ProviderTitleSchema;
