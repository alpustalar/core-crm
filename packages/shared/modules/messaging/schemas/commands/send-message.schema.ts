import { z } from 'zod';

export const SendMessageSchema = z.object({
  type: z.enum(['TEXT', 'TEMPLATE', 'MEDIA']).default('TEXT'),
  body: z.string().min(1).optional(),
  mediaUrl: z.string().url().optional(),
});
