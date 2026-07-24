import { z } from 'zod';

export const ConsentFormTemplateScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','sectorId','title','content','version','isActive','createdByUserId','updatedByUserId','createdAt','updatedAt']);

export default ConsentFormTemplateScalarFieldEnumSchema;
