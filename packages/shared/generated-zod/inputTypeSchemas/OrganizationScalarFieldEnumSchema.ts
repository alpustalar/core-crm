import { z } from 'zod';

export const OrganizationScalarFieldEnumSchema = z.enum(['id','name','slug','phone','email','address','city','district','status','timezone','createdAt','updatedAt','deletedAt']);

export default OrganizationScalarFieldEnumSchema;
