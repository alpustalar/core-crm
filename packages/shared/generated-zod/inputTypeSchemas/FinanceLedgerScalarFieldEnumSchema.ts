import { z } from 'zod';

export const FinanceLedgerScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','patientId','paymentId','installmentId','performedById','type','source','category','status','amount','currency','taxRate','taxAmount','description','documentNo','entryDate','createdAt','updatedAt']);

export default FinanceLedgerScalarFieldEnumSchema;
