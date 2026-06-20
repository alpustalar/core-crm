import { z } from 'zod';
import { AdminRequestTypeSchema } from '@input-type-schemas/AdminRequestTypeSchema';
import { AdminRequestStatusSchema } from '@input-type-schemas/AdminRequestStatusSchema';
import { PaginationSchema } from '@shared';

// ==========================================
// 1. TALEP OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreateAdminRequestPropsSchema = z.object({
  id: z.uuid(),
  type: AdminRequestTypeSchema, // Örn: DATA_EXPORT, SYSTEM_RESET, LIMIT_INCREASE
  targetId: z.string().min(1, 'Hedef ID (targetId) boş bırakılamaz'), // İşlemin uygulanacağı entity ID'si
  requestedBy: z.uuid(), // Talebi oluşturan admin/kullanıcı ID'si
  organizationId: z.uuid().optional(),

  // JSON/Esnek meta veri alanı için zırhlı yapı:
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});
export type CreateAdminRequestProps = z.infer<
  typeof CreateAdminRequestPropsSchema
>;

// ==========================================
// 2. TALEP FİLTRELEME SÖZLEŞMELERİ (FILTERS)
// ==========================================

export const FindAdminRequestsFilterSchema = z.object({
  type: AdminRequestTypeSchema.optional(),
  status: AdminRequestStatusSchema.optional(), //  PENDING, APPROVED, REJECTED
  organizationId: z.uuid().optional(),
  pagination: PaginationSchema,
});
export type FindAdminRequestsFilter = z.infer<
  typeof FindAdminRequestsFilterSchema
>;
