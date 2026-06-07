import { z } from 'zod';

export const TreatmentPackageItemScalarFieldEnumSchema = z.enum(['id','packageId','treatmentId','count']);

export default TreatmentPackageItemScalarFieldEnumSchema;
