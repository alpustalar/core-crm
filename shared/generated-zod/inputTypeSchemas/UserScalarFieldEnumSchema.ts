import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id','displayName','email','emailVerified','status','roleId','picture','clinicId','lastLogin','createdAt','updatedAt','deletedAt']);

export default UserScalarFieldEnumSchema;
