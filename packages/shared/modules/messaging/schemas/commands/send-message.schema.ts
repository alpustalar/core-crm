import { z } from 'zod';

export const SendMessageSchema = z.object({
  type: z.enum(['TEXT', 'TEMPLATE', 'MEDIA']).default('TEXT'),
  body: z.string().min(1).optional(),
  mediaUrl: z.string().url().optional(),
  /** MEDIA gönderiminde alt-tip; yoksa image. */
  mediaType: z.enum(['image', 'document', 'video', 'audio', 'sticker']).optional(),
});
