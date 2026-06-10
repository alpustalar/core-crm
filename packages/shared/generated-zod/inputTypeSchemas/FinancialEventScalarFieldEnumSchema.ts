import { z } from 'zod';

export const FinancialEventScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','type','occurredAt','payload','sourceModule','sourceRefId','dedupeKey','performedById','createdAt']);

export default FinancialEventScalarFieldEnumSchema;
