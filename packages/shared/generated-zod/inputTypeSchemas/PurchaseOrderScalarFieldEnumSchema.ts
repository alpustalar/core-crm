import { z } from 'zod';

export const PurchaseOrderScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','supplierId','purchaseRequestId','status','orderDate','expectedDate','currency','netTotal','vatTotal','grandTotal','note','createdAt','updatedAt']);

export default PurchaseOrderScalarFieldEnumSchema;
