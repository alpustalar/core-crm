import { z } from 'zod';

export const ProductUsageScalarFieldEnumSchema = z.enum(['id','productId','clinicId','batchId','appointmentId','usedByProviderId','quantity','usedAt','notes','stockMovementId','createdAt','updatedAt']);

export default ProductUsageScalarFieldEnumSchema;
