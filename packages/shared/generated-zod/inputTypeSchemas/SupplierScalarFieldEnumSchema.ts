import { z } from 'zod';

export const SupplierScalarFieldEnumSchema = z.enum(['id','name','contactName','phone','email','address','taxNumber','taxOffice','organizationId','isActive','createdAt','updatedAt']);

export default SupplierScalarFieldEnumSchema;
