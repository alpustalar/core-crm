import { z } from 'zod';

export const ResourceScalarFieldEnumSchema = z.enum(['id','clinicId','name','type','description','isActive','createdAt','updatedAt','deletedAt']);

export default ResourceScalarFieldEnumSchema;
