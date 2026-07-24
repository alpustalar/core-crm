import { z } from 'zod';

// ==========================================
// KLİNİK RANDEVU AYARLARI (SATELLITE) SÖZLEŞMESİ
// ==========================================
// 1:1 Clinic satellite — hastanın kendi randevusunu iptal/erteleme kuralları,
// sekreter onay zorunluluğu ve ileri tarih sınırı gibi şube-bazlı randevu
// davranış ayarlarını taşır. Satır yoksa DB default'ları (6/24 saat, patient
// iptal açık, onay kapalı, 90 gün) geçerli kabul edilir.

export const CreateClinicAppointmentSettingsPropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid('Klinik ID zorunludur'),

  allowPatientBooking: z.boolean().optional(),
  rescheduleLimitHours: z.number().int().nonnegative().optional(),
  cancelLimitHours: z.number().int().nonnegative().optional(),
  allowPatientCancel: z.boolean().optional(),
  staffAllowOverbooking: z.boolean().optional(),
  sendSmsReminderHours: z.number().int().nonnegative().optional(),
  maxActivePatientBookings: z.number().int().positive().optional(),
  requireReminderResponse: z.boolean().optional(),
  requireConfirmation: z.boolean().optional(),
  maxFutureBookingDays: z.number().int().positive().optional(),
  slotDurationMinutes: z.number().int().positive().optional(),
});

export type CreateClinicAppointmentSettingsProps = z.infer<
  typeof CreateClinicAppointmentSettingsPropsSchema
>;

// Kısmi güncelleme girişi (entity.update). id/clinicId taşımaz — yalnız gönderilen
// alanlar değişir; verilmeyenler mevcut değerinde kalır.
export const UpdateClinicAppointmentSettingsPropsSchema = z.object({
  allowPatientBooking: z.boolean().optional(),
  rescheduleLimitHours: z.number().int().nonnegative().optional(),
  cancelLimitHours: z.number().int().nonnegative().optional(),
  allowPatientCancel: z.boolean().optional(),
  staffAllowOverbooking: z.boolean().optional(),
  sendSmsReminderHours: z.number().int().nonnegative().optional(),
  maxActivePatientBookings: z.number().int().positive().optional(),
  requireReminderResponse: z.boolean().optional(),
  requireConfirmation: z.boolean().optional(),
  maxFutureBookingDays: z.number().int().positive().optional(),
  slotDurationMinutes: z.number().int().positive().optional(),
});

export type UpdateClinicAppointmentSettingsProps = z.infer<
  typeof UpdateClinicAppointmentSettingsPropsSchema
>;
