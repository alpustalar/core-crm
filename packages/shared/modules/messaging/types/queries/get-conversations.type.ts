import { z } from 'zod';
import { GetConversationsSchema } from '../../schemas/queries';

export type GetConversations = z.infer<typeof GetConversationsSchema>;
