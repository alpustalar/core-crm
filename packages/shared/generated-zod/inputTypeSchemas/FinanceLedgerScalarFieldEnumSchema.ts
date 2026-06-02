import { z } from 'zod';

export const FinanceLedgerScalarFieldEnumSchema = z.enum(['id','clinicId','patientId','paymentId','performedById','type','source','category','status','amount','currency','taxRate','taxAmount','description','documentNo','entryDate','createdAt','updatedAt']);

export default FinanceLedgerScalarFieldEnumSchema;
