import { z } from 'zod';

export const MessageChannelSchema = z.enum(['WHATSAPP','TELEGRAM','INSTAGRAM']);

export type MessageChannelType = `${z.infer<typeof MessageChannelSchema>}`

export default MessageChannelSchema;
