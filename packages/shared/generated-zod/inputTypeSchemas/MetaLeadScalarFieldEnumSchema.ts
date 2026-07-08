import { z } from 'zod';

export const MetaLeadScalarFieldEnumSchema = z.enum(['id','metaAdAccountId','metaLeadId','formId','campaignId','matchedPatientId','matchedAppointmentId','adsetId','adId','campaignName','name','phone','email','rawData','status','matchedAt','createdAt','updatedAt']);

export default MetaLeadScalarFieldEnumSchema;
