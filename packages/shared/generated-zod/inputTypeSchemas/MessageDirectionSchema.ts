import { z } from 'zod';

export const MessageDirectionSchema = z.enum(['INBOUND','OUTBOUND']);

export type MessageDirectionType = `${z.infer<typeof MessageDirectionSchema>}`

export default MessageDirectionSchema;
