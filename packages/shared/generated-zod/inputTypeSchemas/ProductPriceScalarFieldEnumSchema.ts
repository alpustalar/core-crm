import { z } from 'zod';

export const ProductPriceScalarFieldEnumSchema = z.enum(['id','productId','clinicId','type','amount','currency','validFrom','validTo','createdById','createdAt']);

export default ProductPriceScalarFieldEnumSchema;
