import { z } from 'zod';

/////////////////////////////////////////
// SUPPLIER SCHEMA
/////////////////////////////////////////

export const SupplierSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  clinicId: z.string(),
  name: z.string(),
  contactName: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  taxNumber: z.string().nullable(),
  taxOffice: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Supplier = z.infer<typeof SupplierSchema>

export default SupplierSchema;
