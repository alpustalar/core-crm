import { z } from 'zod';

export const PartyScalarFieldEnumSchema = z.enum(['id','organizationId','type','roles','name','taxNumber','nationalId','taxOffice','email','phone','address','isEInvoiceUser','eInvoiceMailbox','receivableAccountId','payableAccountId','originType','originId','isActive','createdAt','updatedAt']);

export default PartyScalarFieldEnumSchema;
