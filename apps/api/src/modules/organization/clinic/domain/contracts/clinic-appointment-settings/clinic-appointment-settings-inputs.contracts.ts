// ==========================================
// KLİNİK RANDEVU AYARLARI (SATELLITE) SÖZLEŞMESİ
// ==========================================
// 1:1 Clinic satellite — hastanın kendi randevusunu iptal/erteleme kuralları,
// sekreter onay zorunluluğu ve ileri tarih sınırı gibi şube-bazlı randevu
// davranış ayarlarını taşır. Satır yoksa DB default'ları (6/24 saat, patient
// iptal açık, onay kapalı, 90 gün) geçerli kabul edilir.
//
// Sayısal invariant'lar (saat sınırları ≥0, aktif randevu/ileri gün ≥1, slot
// ≥5dk) entity'nin kendi businessRulesValidator'ında
// (clinic-appointment-settings.entity.ts) zaten koşuluyor; burada tekrar
// edilmez.

export interface CreateClinicAppointmentSettingsProps {
  id?: string;
  clinicId: string; // Klinik ID zorunludur

  allowPatientBooking?: boolean;
  rescheduleLimitHours?: number;
  cancelLimitHours?: number;
  allowPatientCancel?: boolean;
  staffAllowOverbooking?: boolean;
  sendSmsReminderHours?: number;
  maxActivePatientBookings?: number;
  requireReminderResponse?: boolean;
  requireConfirmation?: boolean;
  maxFutureBookingDays?: number;
  slotDurationMinutes?: number;
}

// Kısmi güncelleme girişi (entity.update). id/clinicId taşımaz — yalnız gönderilen
// alanlar değişir; verilmeyenler mevcut değerinde kalır.
export interface UpdateClinicAppointmentSettingsProps {
  allowPatientBooking?: boolean;
  rescheduleLimitHours?: number;
  cancelLimitHours?: number;
  allowPatientCancel?: boolean;
  staffAllowOverbooking?: boolean;
  sendSmsReminderHours?: number;
  maxActivePatientBookings?: number;
  requireReminderResponse?: boolean;
  requireConfirmation?: boolean;
  maxFutureBookingDays?: number;
  slotDurationMinutes?: number;
}
