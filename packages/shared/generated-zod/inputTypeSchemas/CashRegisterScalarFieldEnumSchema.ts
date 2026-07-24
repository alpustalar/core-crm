import { z } from 'zod';

export const CashRegisterScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','name','currency','status','createdAt','updatedAt']);

export default CashRegisterScalarFieldEnumSchema;
