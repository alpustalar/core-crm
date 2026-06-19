import { z } from 'zod';

export const AssignConversationSchema = z.object({
  assigneeUserId: z.string().uuid(),
});
