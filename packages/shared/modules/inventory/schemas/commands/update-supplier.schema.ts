import { z } from 'zod';

export const UpdateSupplierSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contactName: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  taxNumber: z.string().max(20).optional().nullable(),
  taxOffice: z.string().max(100).optional().nullable(),
});
