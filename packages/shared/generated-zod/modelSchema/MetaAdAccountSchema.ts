import { z } from 'zod';

/////////////////////////////////////////
// META AD ACCOUNT SCHEMA
/////////////////////////////////////////

export const MetaAdAccountSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  adAccountId: z.string(),
  pageId: z.string().nullable(),
  accessToken: z.string(),
  businessName: z.string().nullable(),
  isActive: z.boolean(),
  tokenExpiresAt: z.coerce.date().nullable(),
  lastSyncAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MetaAdAccount = z.infer<typeof MetaAdAccountSchema>

export default MetaAdAccountSchema;
