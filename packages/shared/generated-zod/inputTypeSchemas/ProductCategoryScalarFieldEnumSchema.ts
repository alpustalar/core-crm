import { z } from 'zod';

export const ProductCategoryScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','parentId','name','createdAt','updatedAt']);

export default ProductCategoryScalarFieldEnumSchema;
