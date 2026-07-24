import { z } from 'zod';

export const BankAccountScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','name','bankName','iban','accountNo','currency','status','openingBalance','createdAt','updatedAt']);

export default BankAccountScalarFieldEnumSchema;
