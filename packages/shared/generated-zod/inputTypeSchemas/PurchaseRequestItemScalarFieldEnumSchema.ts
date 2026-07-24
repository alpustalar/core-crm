import { z } from 'zod';

export const PurchaseRequestItemScalarFieldEnumSchema = z.enum(['id','requestId','productId','description','quantity','estimatedUnitPrice','unit']);

export default PurchaseRequestItemScalarFieldEnumSchema;
