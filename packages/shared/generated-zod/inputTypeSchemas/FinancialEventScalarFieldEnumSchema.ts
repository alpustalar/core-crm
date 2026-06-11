import { z } from 'zod';

export const FinancialEventScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','type','occurredAt','payload','sourceModule','sourceRefId','dedupeKey','performedById','createdAt']);

export default FinancialEventScalarFieldEnumSchema;
