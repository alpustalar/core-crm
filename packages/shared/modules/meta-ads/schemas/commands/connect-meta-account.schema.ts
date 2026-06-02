import { z } from 'zod';

export const ConnectMetaAccountSchema = z.object({
  adAccountId: z.string().min(1),
  accessToken: z.string().min(1),
  pageId: z.string().optional(),
  businessName: z.string().optional(),
});
