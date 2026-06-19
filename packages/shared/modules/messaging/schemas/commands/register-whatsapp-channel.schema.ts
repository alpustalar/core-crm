import { z } from 'zod';

export const RegisterWhatsappChannelSchema = z.object({
  phoneNumberId: z.string().min(1),
  wabaId: z.string().optional(),
  displayPhoneNumber: z.string().optional(),
  accessToken: z.string().optional(),
  verifyToken: z.string().optional(),
});
