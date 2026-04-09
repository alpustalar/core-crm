import { z } from 'zod';

export const DoctorTreatmentScalarFieldEnumSchema = z.enum(['id','customPrice','customDuration','isActive','updatedAt','createdAt','doctorId','treatmentId']);

export default DoctorTreatmentScalarFieldEnumSchema;
