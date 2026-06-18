import { z } from 'zod';

export const TaxParameterScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','key','rate','validFrom','validTo','createdAt','updatedAt']);

export default TaxParameterScalarFieldEnumSchema;
