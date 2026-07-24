import { z } from 'zod';
import { ActivityTypeSchema } from '@input-type-schemas/ActivityTypeSchema';
import { ActivityStatusSchema } from '@input-type-schemas/ActivityStatusSchema';
import { Pagination } from '@shared/common';

// ==========================================
// AKTİVİTE OLUŞTURMA (CREATE ACTIVITY)
// clinicId/organizationId/createdById handler'dan (bağlam) gelir — DTO'da yoktur.
// ==========================================

export const CreateActivitySchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  leadId: z.uuid().nullable().optional(),
  patientId: z.uuid().nullable().optional(),
  type: ActivityTypeSchema,
  subject: z.string().min(1),
  notes: z.string().nullable().optional(),
  assignedToId: z.uuid().nullable().optional(),
  createdById: z.uuid().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
});
export type CreateActivityProps = z.infer<typeof CreateActivitySchema>;

// ==========================================
// AKTİVİTE GÜNCELLEME (UPDATE ACTIVITY)
// Yalnız sağlanan (undefined olmayan) alanlar güncellenir. Status complete/delete ile yönetilir.
// ==========================================

export const UpdateActivitySchema = z.object({
  subject: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  assignedToId: z.uuid().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
});
export type UpdateActivityProps = z.infer<typeof UpdateActivitySchema>;

// ==========================================
// LİSTELEME FİLTRELERİ (read-model)
// ==========================================

export const FindActivitiesByLeadFilterSchema = z.object({
  leadId: z.uuid(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindActivitiesByLeadFilter = z.infer<
  typeof FindActivitiesByLeadFilterSchema
>;

export const FindMyTasksFilterSchema = z.object({
  assignedToId: z.uuid(),
  clinicId: z.uuid().optional(),
  status: ActivityStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindMyTasksFilter = z.infer<typeof FindMyTasksFilterSchema>;
