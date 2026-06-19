import { z } from 'zod';

export const ConversationScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','channel','contactPhone','contactName','patientId','leadId','status','assignedUserId','lastMessageAt','createdAt','updatedAt']);

export default ConversationScalarFieldEnumSchema;
