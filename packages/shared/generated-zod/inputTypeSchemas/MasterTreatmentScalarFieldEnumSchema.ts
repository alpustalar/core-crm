import { z } from 'zod';

export const MasterTreatmentScalarFieldEnumSchema = z.enum(['id','treatmentCategoryId','slug','defaultDuration','sutCode']);

export default MasterTreatmentScalarFieldEnumSchema;
