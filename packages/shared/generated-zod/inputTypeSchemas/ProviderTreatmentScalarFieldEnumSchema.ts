import { z } from 'zod';

export const ProviderTreatmentScalarFieldEnumSchema = z.enum(['id','providerId','customPrice','customDuration','isActive','updatedAt','createdAt','treatmentId']);

export default ProviderTreatmentScalarFieldEnumSchema;
