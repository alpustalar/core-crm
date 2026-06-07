import { z } from 'zod';

/////////////////////////////////////////
// META AD ACCOUNT SCHEMA
/////////////////////////////////////////

export const MetaAdAccountSchema = z.object({
  id: z.uuid(),
  clinicId: z.string(),
  adAccountId: z.string(),
  accessToken: z.string(),
  pageId: z.string().nullable(),
  businessName: z.string().nullable(),
  isActive: z.boolean(),
  tokenExpiresAt: z.coerce.date().nullable(),
  lastSyncAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MetaAdAccount = z.infer<typeof MetaAdAccountSchema>

export default MetaAdAccountSchema;
