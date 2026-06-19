import { z } from 'zod';

export const MessageTypeSchema = z.enum(['TEXT','TEMPLATE','MEDIA']);

export type MessageTypeType = `${z.infer<typeof MessageTypeSchema>}`

export default MessageTypeSchema;
