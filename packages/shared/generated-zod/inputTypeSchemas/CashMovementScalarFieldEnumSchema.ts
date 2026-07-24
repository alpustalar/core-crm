import { z } from 'zod';

export const CashMovementScalarFieldEnumSchema = z.enum(['id','cashSessionId','clinicId','organizationId','type','direction','amount','currency','description','referenceType','referenceId','performedById','occurredAt','createdAt']);

export default CashMovementScalarFieldEnumSchema;
