import { z } from 'zod';

export const UpdateWhatsappBusinessProfileSchema = z.object({
  about: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  vertical: z.string().optional(),
  websites: z.array(z.string().url()).optional(),
});
