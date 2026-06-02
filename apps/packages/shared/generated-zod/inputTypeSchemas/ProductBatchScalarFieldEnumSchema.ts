import { z } from 'zod';

export const ProductBatchScalarFieldEnumSchema = z.enum(['id','productId','clinicId','supplierId','lotNumber','expiresAt','quantity','purchasePrice','currency','receivedAt','notes','createdAt','updatedAt']);

export default ProductBatchScalarFieldEnumSchema;
