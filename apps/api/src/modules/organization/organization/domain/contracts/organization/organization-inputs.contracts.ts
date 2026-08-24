import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';

// ==========================================
// 1. KURUM OLUŞTURMA SÖZLEŞMELERİ (PROPS)
// ==========================================
// name/email/phone format kontrolleri HTTP sınırında (CreateOrganizationSchema,
// @shared/modules/organization) doğrulanır; domain katmanı ayrıca tekrar etmez.

export interface CreateOrganizationProps {
  id: string; // 2026 Standartı: Katı iç sistem ID doğrulaması
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  timezone?: TimeZoneType; // Boş gelirse iş mantığında varsayılan değer atanabilir
}

export interface CreateOrganizationInternalRelationsProps {
  id: string;
}

// ==========================================
// 2. KURUM GÜNCELLEME SÖZLEŞMELERİ (PROPS)
// ==========================================

export interface UpdateOrganizationInfoProps {
  // Güncelleme esnasında tüm alanlar opsiyoneldir (Sadece gelen alanlar işlenir)
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
}
