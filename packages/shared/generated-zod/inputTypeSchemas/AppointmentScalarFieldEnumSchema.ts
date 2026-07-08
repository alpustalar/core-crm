import { z } from 'zod';

export const AppointmentScalarFieldEnumSchema = z.enum(['id','patientName','patientPhone','patientEmail','startTime','endTime','source','timezone','treatmentType','notes','approvedAt','approvedBy','creatorType','createdById','createdByRealName','status','canceledAt','canceledBy','cancelReason','createdAt','updatedAt','examinationType','visitType','isConsultation','externalSystem','externalId','treatmentId','clinicId','providerId','patientId','resourceId','isDeleted','deletedAt']);

export default AppointmentScalarFieldEnumSchema;
