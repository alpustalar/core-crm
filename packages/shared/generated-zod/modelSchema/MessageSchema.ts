import { z } from 'zod';
import { MessageDirectionSchema } from '../inputTypeSchemas/MessageDirectionSchema'
import { MessageTypeSchema } from '../inputTypeSchemas/MessageTypeSchema'
import { MessageStatusSchema } from '../inputTypeSchemas/MessageStatusSchema'

/////////////////////////////////////////
// MESSAGE SCHEMA
/////////////////////////////////////////

/**
 * Yazışma içindeki tek mesaj (gelen/giden).
 */
export const MessageSchema = z.object({
  direction: MessageDirectionSchema,
  type: MessageTypeSchema,
  status: MessageStatusSchema,
  id: z.uuid(),
  conversationId: z.string(),
  body: z.string().nullable(),
  mediaUrl: z.string().nullable(),
  externalId: z.string().nullable(),
  errorReason: z.string().nullable(),
  sentByUserId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Message = z.infer<typeof MessageSchema>

export default MessageSchema;
