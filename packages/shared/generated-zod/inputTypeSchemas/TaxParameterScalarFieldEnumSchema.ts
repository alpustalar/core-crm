import { z } from 'zod';

export const TaxParameterScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','key','rate','validFrom','validTo','createdAt','updatedAt']);

export default TaxParameterScalarFieldEnumSchema;
