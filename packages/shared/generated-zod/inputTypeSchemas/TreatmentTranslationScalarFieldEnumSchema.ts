import { z } from 'zod';

export const TreatmentTranslationScalarFieldEnumSchema = z.enum(['id','masterTreatmentId','languageId','treatmentId','treatmentCategoryId','name','description','aftercareInstructions']);

export default TreatmentTranslationScalarFieldEnumSchema;
