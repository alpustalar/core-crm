import { z } from 'zod';

export const PurchaseOrderItemScalarFieldEnumSchema = z.enum(['id','orderId','productId','description','quantityOrdered','quantityReceived','unitPrice','vatRate','lineNet','lineVat','lineTotal']);

export default PurchaseOrderItemScalarFieldEnumSchema;
