import { z } from 'zod';

/////////////////////////////////////////
// SUPPLIER SCHEMA
/////////////////////////////////////////

export const SupplierSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  contactName: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  taxNumber: z.string().nullable(),
  taxOffice: z.string().nullable(),
  organizationId: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Supplier = z.infer<typeof SupplierSchema>

export default SupplierSchema;
