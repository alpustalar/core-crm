import { z } from 'zod';

export const CreateSupplierSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, 'Tedarikçi adı zorunludur'),
  contactName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),
  address: z.string().nullable().optional(),
  taxNumber: z.string().nullable().optional(),
  taxOffice: z.string().nullable().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
});

export type CreateSupplierProps = z.infer<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  contactName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),
  address: z.string().nullable().optional(),
  taxNumber: z.string().nullable().optional(),
  taxOffice: z.string().nullable().optional(),
});
export type UpdateSupplierProps = z.infer<typeof UpdateSupplierSchema>;
