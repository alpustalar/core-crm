import { z } from 'zod';

export const AccountingPeriodScalarFieldEnumSchema = z.enum(['id','organizationId','year','status','startsAt','endsAt','createdAt','updatedAt']);

export default AccountingPeriodScalarFieldEnumSchema;
