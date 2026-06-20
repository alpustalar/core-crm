import { z } from 'zod';
import { LeadSourceSchema } from '@input-type-schemas/LeadSourceSchema';
import { LeadStatusSchema } from '@input-type-schemas/LeadStatusSchema';
import { Pagination } from '@shared/common';

// ==========================================
// 1. LEAD OLUŞTURMA SÖZLEŞMESİ (CREATE LEAD)
// ==========================================

export const CreateLeadSchema = z.object({
  id: z.uuid(),
  clinicId: z.uuid(),
  source: LeadSourceSchema,
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.email('Geçersiz e-posta formatı').optional(),
  notes: z.string().optional(),
  assignedToId: z.uuid().optional(),
  whatsAppConversationId: z.string().optional(),
});

export type CreateLeadProps = z.infer<typeof CreateLeadSchema>;

export const FindLeadsFilterSchema = z.object({
  clinicId: z.uuid(),
  status: LeadStatusSchema.optional(),
  source: LeadSourceSchema.optional(),
  assignedToId: z.uuid().optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});

export type FindLeadsFilter = z.infer<typeof FindLeadsFilterSchema>;
