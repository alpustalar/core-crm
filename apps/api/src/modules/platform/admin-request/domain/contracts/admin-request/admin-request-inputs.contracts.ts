import { AdminRequestTypeType as AdminRequestType } from '@input-type-schemas/AdminRequestTypeSchema';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';

// ==========================================
// 1. TALEP OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================

export interface CreateAdminRequestProps {
  id?: string;
  type: AdminRequestType; // Örn: DATA_EXPORT, SYSTEM_RESET, LIMIT_INCREASE
  targetId: string; // İşlemin uygulanacağı entity ID'si — HTTP sınırında (CreateAdminRequestSchema) UUID doğrulanır
  requestedBy: string; // Talebi oluşturan admin/kullanıcı ID'si — ctx.actor'dan gelir (trusted)
  organizationId?: string;

  clinicId?: string;
  metadata?: JsonValue | null;
}
