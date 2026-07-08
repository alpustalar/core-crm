import { z } from 'zod';

export const AccountScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','parentId','code','name','type','normalSide','isPostable','requiresParty','currency','isActive','createdAt','updatedAt']);

export default AccountScalarFieldEnumSchema;
