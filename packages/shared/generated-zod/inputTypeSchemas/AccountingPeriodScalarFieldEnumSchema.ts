import { z } from 'zod';

export const AccountingPeriodScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','year','status','startsAt','endsAt','createdAt','updatedAt']);

export default AccountingPeriodScalarFieldEnumSchema;
