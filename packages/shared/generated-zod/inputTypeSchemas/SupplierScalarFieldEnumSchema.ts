import { z } from 'zod';

export const SupplierScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','name','contactName','phone','email','address','taxNumber','taxOffice','isActive','createdAt','updatedAt']);

export default SupplierScalarFieldEnumSchema;
