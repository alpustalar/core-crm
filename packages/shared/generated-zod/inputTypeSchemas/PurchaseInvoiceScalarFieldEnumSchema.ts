import { z } from 'zod';

export const PurchaseInvoiceScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','supplierId','invoiceNumber','invoiceDate','lineAccountCode','vatRate','netTotal','vatTotal','grandTotal','currency','status','createdAt','updatedAt']);

export default PurchaseInvoiceScalarFieldEnumSchema;
