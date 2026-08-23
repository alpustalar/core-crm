import { z } from 'zod';

export const CreateSupplierSchema = z.object({
  name: z.string().min(1).max(200),
  contactName: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.email().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  taxNumber: z.string().max(20).optional().nullable(),
  taxOffice: z.string().max(100).optional().nullable(),
  // organizationId ALINMAZ: kiracı kimliği backend'de clinicId'den türetilir
  // (TENANT_SCOPE_RESOLVER). İstemciden alınsaydı başka bir kiracının org
  // kimliğiyle eşleştirilebilirdi.
  clinicId: z.uuid(),
});
