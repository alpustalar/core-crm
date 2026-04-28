import { z } from 'zod';

export const ProviderTreatmentScalarFieldEnumSchema = z.enum(['id','customPrice','customDuration','isActive','updatedAt','createdAt','providerId','treatmentId']);

export default ProviderTreatmentScalarFieldEnumSchema;
