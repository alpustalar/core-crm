import { z } from 'zod';

export const UserCapabilityScalarFieldEnumSchema = z.enum(['id','userId','capabilityId','grantedById','reason','createdAt']);

export default UserCapabilityScalarFieldEnumSchema;
