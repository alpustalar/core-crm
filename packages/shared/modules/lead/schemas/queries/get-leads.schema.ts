import { z } from 'zod';

export const GetLeadsSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
  source: z.enum(['WHATSAPP', 'MANUAL']).optional(),
  assignedToId: z.string().uuid().optional(),
});
