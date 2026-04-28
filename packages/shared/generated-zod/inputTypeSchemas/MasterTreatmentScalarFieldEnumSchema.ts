import { z } from 'zod';

export const MasterTreatmentScalarFieldEnumSchema = z.enum(['id','slug','sectorId','treatmentCategoryId','defaultDuration']);

export default MasterTreatmentScalarFieldEnumSchema;
