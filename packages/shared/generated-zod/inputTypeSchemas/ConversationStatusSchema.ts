import { z } from 'zod';

export const ConversationStatusSchema = z.enum(['OPEN','PENDING','CLOSED']);

export type ConversationStatusType = `${z.infer<typeof ConversationStatusSchema>}`

export default ConversationStatusSchema;
