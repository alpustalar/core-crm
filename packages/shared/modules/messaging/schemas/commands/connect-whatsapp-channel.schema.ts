import { z } from 'zod';

export const ConnectWhatsappChannelSchema = z.object({
  code: z.string().min(1),
  wabaId: z.string().min(1),
  phoneNumberId: z.string().min(1),
  displayPhoneNumber: z.string().optional(),
});
