import { z } from 'zod';

export const ResourceScalarFieldEnumSchema = z.enum(['id','name','type','description','isActive','clinicId','createdAt','updatedAt','deletedAt']);

export default ResourceScalarFieldEnumSchema;
