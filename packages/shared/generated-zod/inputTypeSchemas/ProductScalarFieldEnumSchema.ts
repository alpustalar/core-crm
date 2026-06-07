import { z } from 'zod';

export const ProductScalarFieldEnumSchema = z.enum(['id','name','stockCode','barcode','brand','description','imageUrl','unit','condition','vatRate','criticalStockQty','reorderQty','organizationId','categoryId','supplierId','isActive','createdAt','updatedAt','deletedAt']);

export default ProductScalarFieldEnumSchema;
