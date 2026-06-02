import { z } from 'zod';

export const MetaLeadScalarFieldEnumSchema = z.enum(['id','metaAdAccountId','metaLeadId','formId','campaignId','campaignName','adsetId','adId','name','phone','email','rawData','status','matchedPatientId','matchedAppointmentId','matchedAt','createdAt','updatedAt']);

export default MetaLeadScalarFieldEnumSchema;
