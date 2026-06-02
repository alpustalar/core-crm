import { z } from 'zod';

export const TreatmentPackageScalarFieldEnumSchema = z.enum(['id','clinicId','name','examinationCount','controlCount','validityDays','price','isActive','createdAt','updatedAt','deletedAt']);

export default TreatmentPackageScalarFieldEnumSchema;
