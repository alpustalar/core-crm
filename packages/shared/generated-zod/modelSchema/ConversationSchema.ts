import { z } from 'zod';
import { MessageChannelSchema } from '../inputTypeSchemas/MessageChannelSchema'
import { ConversationStatusSchema } from '../inputTypeSchemas/ConversationStatusSchema'

/////////////////////////////////////////
// CONVERSATION SCHEMA
/////////////////////////////////////////

/**
 * Bir kontak ile yazışma başlığı (thread). clinicId denormalize scalar (bounded-context;
 * Clinic ilişkisel tablolarına sızılmaz). Kontak hasta/lead ile ilkel id üzerinden eşlenir.
 */
export const ConversationSchema = z.object({
  channel: MessageChannelSchema,
  status: ConversationStatusSchema,
  id: z.uuid(),
  clinicId: z.string(),
  organizationId: z.string(),
  contactPhone: z.string(),
  contactName: z.string().nullable(),
  patientId: z.string().nullable(),
  leadId: z.string().nullable(),
  assignedUserId: z.string().nullable(),
  lastMessageAt: z.coerce.date().nullable(),
  lastInboundAt: z.coerce.date().nullable(),
  unreadCount: z.number().int(),
  agentReadAt: z.coerce.date().nullable(),
  windowExpiresAt: z.coerce.date().nullable(),
  marketingOptOut: z.boolean(),
  optOutAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Conversation = z.infer<typeof ConversationSchema>

export default ConversationSchema;
