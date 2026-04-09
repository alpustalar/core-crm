import { z } from 'zod';

export const MasterTreatmentScalarFieldEnumSchema = z.enum(['id','name','category','defaultDuration']);

export default MasterTreatmentScalarFieldEnumSchema;
