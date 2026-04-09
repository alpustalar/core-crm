import { z } from 'zod';

export const TreatmentScalarFieldEnumSchema = z.enum(['id','name','category','duration','minDuration','maxDuration','description','isActive','requiresApproval','isPackageOnly','displayOrder','clinicId','masterTreatmentId','createdAt','deletedAt','updatedAt']);

export default TreatmentScalarFieldEnumSchema;
