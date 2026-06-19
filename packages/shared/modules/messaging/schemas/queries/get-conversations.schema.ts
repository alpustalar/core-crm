import { z } from 'zod';

export const GetConversationsSchema = z.object({
  status: z.enum(['OPEN', 'PENDING', 'CLOSED']).optional(),
  assignedUserId: z.string().uuid().optional(),
});
