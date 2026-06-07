import { z } from 'zod';

export const ProductCategoryScalarFieldEnumSchema = z.enum(['id','name','organizationId','parentId','createdAt','updatedAt']);

export default ProductCategoryScalarFieldEnumSchema;
