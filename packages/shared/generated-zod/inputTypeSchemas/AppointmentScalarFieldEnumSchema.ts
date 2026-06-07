import { z } from 'zod';

export const AppointmentScalarFieldEnumSchema = z.enum(['id','patientName','patientPhone','patientEmail','startTime','endTime','timezone','treatmentType','notes','status','canceledAt','canceledBy','cancelReason','createdAt','updatedAt','examinationType','visitType','externalSystem','externalId','treatmentId','clinicId','providerId','patientId','resourceId','isDeleted','deletedAt']);

export default AppointmentScalarFieldEnumSchema;
