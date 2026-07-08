import { z } from 'zod';

export const LeadScalarFieldEnumSchema = z.enum(['id','clinicId','assignedToId','patientId','appointmentId','metaLeadId','campaignId','adId','adsetId','ctwaClid','whatsAppConversationId','source','status','name','phone','email','notes','convertedAt','lostReason','lostAt','campaignName','medium','sourceUrl','createdAt','updatedAt']);

export default LeadScalarFieldEnumSchema;
