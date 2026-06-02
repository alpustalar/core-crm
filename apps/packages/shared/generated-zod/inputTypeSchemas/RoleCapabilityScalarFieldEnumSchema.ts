import { z } from 'zod';

export const RoleCapabilityScalarFieldEnumSchema = z.enum(['id','roleId','capabilityId','createdAt']);

export default RoleCapabilityScalarFieldEnumSchema;
