import { z } from 'zod';

export const PatientTreatmentPackageScalarFieldEnumSchema = z.enum(['id','patientId','packageId','providerId','paymentId','startDate','endDate','notes','status','usedExaminationCount','usedControlCount','createdAt','updatedAt']);

export default PatientTreatmentPackageScalarFieldEnumSchema;
