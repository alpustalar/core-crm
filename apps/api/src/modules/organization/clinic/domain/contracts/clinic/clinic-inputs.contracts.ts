import { UpdateClinic } from '@shared';
import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';
import { GlobalStatusType as GlobalStatus } from '@input-type-schemas/GlobalStatusSchema';

// ==========================================
// 2. ŞUBE OLUŞTURMA VE İLİŞKİ SÖZLEŞMELERİ (PROPS & RELATIONS)
// ==========================================
// name/email/logo format kontrolleri HTTP sınırında (CreateClinicSchema,
// @shared/modules/clinic) ve VO'larda (Name/Email/Img/TimeZone.create) zaten
// enforce ediliyor. `consultationSlotDuration` pozitif-tam-sayı kuralı ise
// hiçbir yerde koşulmuyordu — Clinic.create()/update() içine Guard.monitor ile
// taşındı (bkz. clinic.entity.ts).

export interface CreateClinicProps {
  id?: string;
  name: string;
  sectorId: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  consultationSlotDuration: number;
  status?: GlobalStatus;
  timezone: TimeZoneType;
  logo?: string | null;
  organizationId?: string;
}

export interface CreateClinicInternalRelations {
  organizationId: string;
  clinicId: string;
}

// ==========================================
// 3. YÖNETİCİ GÜNCELLEME SÖZLEŞMELERİ (PROPS)
// ==========================================

export interface UpdateAsManagerProps {
  id: string; // Güncellenecek klinik ID
  userId: string; // İşlemi yapan yönetici ID
  data: UpdateClinic;
}
