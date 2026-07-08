import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
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
  id: z.string(),
  conversationId: z.string(),
  externalId: z.string().nullable(),
  sentByUserId: z.string().nullable(),
  replyToExternalId: z.string().nullable(),
  body: z.string().nullable(),
  mediaUrl: z.string().nullable(),
  errorReason: z.string().nullable(),
  errorCode: z.string().nullable(),
  payload: JsonValueSchema.nullable(),
  mediaType: z.string().nullable(),
  pricingCategory: z.string().nullable(),
  billable: z.boolean().nullable(),
  templateName: z.string().nullable(),
  templateLanguage: z.string().nullable(),
  templateParams: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Message = z.infer<typeof MessageSchema>

export default MessageSchema;
