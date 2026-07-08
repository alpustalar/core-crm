import { z } from 'zod';

export const PartyScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','originId','type','roles','name','taxNumber','nationalId','taxOffice','email','phone','address','isEInvoiceUser','eInvoiceMailbox','receivableAccountId','payableAccountId','originType','isActive','createdAt','updatedAt']);

export default PartyScalarFieldEnumSchema;
