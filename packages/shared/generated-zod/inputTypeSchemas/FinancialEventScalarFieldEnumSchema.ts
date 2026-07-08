import { z } from 'zod';

export const FinancialEventScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','performedById','type','occurredAt','payload','sourceModule','sourceRefId','dedupeKey','createdAt']);

export default FinancialEventScalarFieldEnumSchema;
