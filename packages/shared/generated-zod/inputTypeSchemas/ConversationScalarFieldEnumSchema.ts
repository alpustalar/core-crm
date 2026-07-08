import { z } from 'zod';

export const ConversationScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','assignedUserId','lastMessageAt','patientId','leadId','lastInboundAt','status','channel','contactPhone','contactName','unreadCount','agentReadAt','windowExpiresAt','marketingOptOut','optOutAt','createdAt','updatedAt']);

export default ConversationScalarFieldEnumSchema;
