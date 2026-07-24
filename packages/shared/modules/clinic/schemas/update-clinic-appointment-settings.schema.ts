import { z } from 'zod';

/**
 * Kliniğin randevu davranış ayarlarının güncellenmesi. Tüm alanlar opsiyonel
 * (kısmi güncelleme) — yalnız gönderilen alanlar değişir. clinicId gövdede değil,
 * path'ten gelir. Satır yoksa handler default'tan üretip upsert eder.
 */
export const UpdateClinicAppointmentSettingsSchema = z.object({
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
  slotDurationMinutes: z.number().int().min(5).optional(),
});
