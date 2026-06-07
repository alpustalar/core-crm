import { z } from 'zod';

export const TreatmentScalarFieldEnumSchema = z.enum(['id','slug','treatmentCategoryId','duration','minDuration','maxDuration','sutCode','description','isActive','requiresApproval','isPackageOnly','displayOrder','clinicId','masterTreatmentId','createdAt','deletedAt','updatedAt']);

export default TreatmentScalarFieldEnumSchema;
