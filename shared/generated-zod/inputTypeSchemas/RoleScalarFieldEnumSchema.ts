import { z } from 'zod';

export const RoleScalarFieldEnumSchema = z.enum(['id','name','slug','priority','isSystemRole','createdAt','updatedAt']);

export default RoleScalarFieldEnumSchema;
