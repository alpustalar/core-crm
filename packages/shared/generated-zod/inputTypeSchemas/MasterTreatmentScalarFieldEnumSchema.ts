import { z } from 'zod';

export const MasterTreatmentScalarFieldEnumSchema = z.enum(['id','slug','treatmentCategoryId','defaultDuration','sutCode']);

export default MasterTreatmentScalarFieldEnumSchema;
