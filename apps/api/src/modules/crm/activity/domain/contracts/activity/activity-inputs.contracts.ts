import { ActivityTypeType as ActivityType } from '@input-type-schemas/ActivityTypeSchema';

// ==========================================
// AKTİVİTE OLUŞTURMA (CREATE ACTIVITY)
// clinicId/organizationId/createdById handler'dan (bağlam) gelir — DTO'da yoktur.
// ==========================================

export interface CreateActivityProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  leadId?: string | null;
  patientId?: string | null;
  type: ActivityType;
  subject: string;
  notes?: string | null;
  assignedToId?: string | null;
  createdById?: string | null;
  dueAt?: Date | null;
}

// ==========================================
// AKTİVİTE GÜNCELLEME (UPDATE ACTIVITY)
// Yalnız sağlanan (undefined olmayan) alanlar güncellenir. Status complete/delete ile yönetilir.
// ==========================================

export interface UpdateActivityProps {
  subject?: string;
  notes?: string | null;
  assignedToId?: string | null;
  dueAt?: Date | null;
}
