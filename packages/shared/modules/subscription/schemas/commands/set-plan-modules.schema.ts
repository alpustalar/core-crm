import { z } from 'zod';

/** Planın bundle içeriği — gönderilen liste mevcut bağları tümüyle değiştirir. */
export const SetPlanModulesSchema = z.object({
  moduleIds: z.array(z.uuid()),
});
