// ==========================================
// KLİNİK İSTİSNA (EXCEPTION) SÖZLEŞMESİ
// ==========================================
// `reason` boş string olamaz kuralı hiçbir yerde (HTTP DTO yok, entity'de de
// yoktu) enforce edilmiyordu — bu dönüşümle birlikte
// ClinicException.create()/updateReason() içine Guard.monitor ile taşındı
// (bkz. clinic-exception.entity.ts).

export interface ClinicExceptionCreateProps {
  id?: string;
  clinicId: string; // Klinik ID zorunludur

  // İstisnanın gerçekleşeceği tarih
  date: Date;

  // İstisna durumu: Varsayılan olarak kapalı (true) kabul edilebilir
  // ancak business logic'ine göre özelleştirilebilir
  isClosed?: boolean;

  // İstisna gerekçesi
  reason?: string | null;
}
