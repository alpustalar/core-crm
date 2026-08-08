import { z } from 'zod';

export const ExternalWorkOrderScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','supplierId','patientId','treatmentId','providerId','referenceNo','status','sentAt','dueDate','receivedAt','fittedAt','cancelledAt','cancelReason','agreedCost','actualCost','currency','remakeOfId','remakeReason','overdueNotifiedAt','note','createdById','createdAt','updatedAt']);

export default ExternalWorkOrderScalarFieldEnumSchema;
