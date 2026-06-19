import { z } from 'zod';
import { AssignConversationSchema } from '../../schemas/commands';

export type AssignConversation = z.infer<typeof AssignConversationSchema>;
