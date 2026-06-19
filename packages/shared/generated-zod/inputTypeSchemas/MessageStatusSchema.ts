import { z } from 'zod';

export const MessageStatusSchema = z.enum(['RECEIVED','QUEUED','SENT','DELIVERED','READ','FAILED']);

export type MessageStatusType = `${z.infer<typeof MessageStatusSchema>}`

export default MessageStatusSchema;
