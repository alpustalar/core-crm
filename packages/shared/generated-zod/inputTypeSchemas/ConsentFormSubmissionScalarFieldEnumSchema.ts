import { z } from 'zod';

export const ConsentFormSubmissionScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','patientId','templateId','templateVersion','templateTitleSnapshot','templateContentSnapshot','signatureImage','signedAt','signedByUserId','appointmentId','treatmentId','createdAt']);

export default ConsentFormSubmissionScalarFieldEnumSchema;
