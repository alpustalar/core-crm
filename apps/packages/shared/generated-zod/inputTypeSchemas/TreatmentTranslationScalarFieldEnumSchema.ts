import { z } from 'zod';

export const TreatmentTranslationScalarFieldEnumSchema = z.enum(['id','masterTreatmentId','languageId','treatmentId','name','description','aftercareInstructions']);

export default TreatmentTranslationScalarFieldEnumSchema;
