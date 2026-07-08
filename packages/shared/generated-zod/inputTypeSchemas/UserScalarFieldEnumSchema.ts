import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id','roleId','clinicId','displayName','email','emailVerified','status','picture','phoneNumber','lastLogin','createdAt','updatedAt','deletedAt']);

export default UserScalarFieldEnumSchema;
