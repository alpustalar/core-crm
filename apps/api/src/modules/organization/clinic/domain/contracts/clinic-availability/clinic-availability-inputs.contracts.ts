// ==========================================
// KLİNİK MESAİ SÖZLEŞMESİ (PROPS)
// ==========================================
// dayOfWeek 0-6 aralığı entity.create() içinde ClinicAvailability.validate.isDayOfWeek
// ile; startMinute/endMinute 0-1440 aralığı + "kapalı değilse bitiş > başlangıç"
// kuralı DayMinute/DayMinuteRange VO'larında (DayMinuteRange.create) zaten
// koşuluyor — burada tekrar edilmez.

export interface ClinicAvailabilityCreateProps {
  id?: string;
  clinicId: string; // Klinik ID zorunludur

  // Gün kontrolü: 0-6 arası (Pazar-Cumartesi)
  dayOfWeek: number;

  // Günün dakikası: 0-1440 aralığı
  startMinute: number;
  endMinute: number;

  // Varsayılan değer yönetimi
  isClosed?: boolean;
}
