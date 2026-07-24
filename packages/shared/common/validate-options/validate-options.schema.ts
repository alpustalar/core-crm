import { z } from 'zod';

export const ValidateOptionsSchema = z.object({
  businessRulesEnabled: z.boolean().default(true),
  systemOverride: z.boolean().default(false),
});
