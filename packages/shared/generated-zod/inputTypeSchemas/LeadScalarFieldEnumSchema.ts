import { z } from 'zod';

export const LeadScalarFieldEnumSchema = z.enum(['id','clinicId','source','status','name','phone','email','notes','assignedToId','patientId','appointmentId','convertedAt','lostReason','lostAt','whatsAppConversationId','createdAt','updatedAt']);

export default LeadScalarFieldEnumSchema;
