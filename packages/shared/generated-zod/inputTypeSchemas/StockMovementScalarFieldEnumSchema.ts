import { z } from 'zod';

export const StockMovementScalarFieldEnumSchema = z.enum(['id','productId','clinicId','batchId','type','direction','quantity','unitPrice','currency','vatRate','vatAmount','totalAmount','financeLedgerId','performedById','notes','createdAt']);

export default StockMovementScalarFieldEnumSchema;
