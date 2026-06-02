import { z } from 'zod';

export const CreateLeadSchema = z.object({
  source: z.enum(['WHATSAPP', 'MANUAL']),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
});
