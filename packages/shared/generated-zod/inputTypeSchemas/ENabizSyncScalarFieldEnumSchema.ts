import { z } from 'zod';

export const ENabizSyncScalarFieldEnumSchema = z.enum(['id', 'appointmentId', 'status', 'referenceNo', 'submittedAt', 'lastAttemptAt', 'attemptCount', 'errorCode', 'errorMessage', 'rawRequest', 'rawResponse', 'createdAt', 'updatedAt']);

export default ENabizSyncScalarFieldEnumSchema;
