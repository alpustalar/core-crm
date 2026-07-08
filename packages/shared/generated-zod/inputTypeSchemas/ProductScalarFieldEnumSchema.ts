import { z } from 'zod';

export const ProductScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','categoryId','supplierId','name','stockCode','barcode','brand','description','imageUrl','unit','condition','vatRate','criticalStockQty','reorderQty','isActive','createdAt','updatedAt','deletedAt']);

export default ProductScalarFieldEnumSchema;
