import { z } from 'zod';

export const PurchaseRequestScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','requestedById','status','neededBy','note','reviewedById','reviewedAt','reviewNote','createdAt','updatedAt']);

export default PurchaseRequestScalarFieldEnumSchema;
