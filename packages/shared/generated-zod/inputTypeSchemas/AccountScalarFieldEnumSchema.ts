import { z } from 'zod';

export const AccountScalarFieldEnumSchema = z.enum(['id','organizationId','code','name','parentId','type','normalSide','isPostable','requiresParty','currency','isActive','createdAt','updatedAt']);

export default AccountScalarFieldEnumSchema;
