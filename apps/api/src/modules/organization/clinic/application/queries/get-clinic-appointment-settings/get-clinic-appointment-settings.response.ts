import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Kliniğin randevu davranış ayarları okuma-modeli. Satellite satırı yoksa DB
 * default'ları ile doldurulur (entity `createDefault` ile birebir). Entity değil,
 * düz veri döner — HTTP/bus sınırını güvenle geçer.
 */
export interface ClinicAppointmentSettingsView {
  clinicId: string;
  allowPatientBooking: boolean;
  rescheduleLimitHours: number;
  cancelLimitHours: number;
  allowPatientCancel: boolean;
  requireConfirmation: boolean;
  maxActivePatientBookings: number;
  maxFutureBookingDays: number;
  slotDurationMinutes: number;
  /** Çalışanlar aynı doktora/koltuğa çift (çakışan) randevu yazabilsin mi? */
  staffAllowOverbooking: boolean;
  /** Randevudan kaç saat önce hatırlatma gönderilsin (0 = kapalı). */
  sendSmsReminderHours: number;
  /** Hatırlatmaya hasta yanıtı (iki yönlü onay) bekleniyor mu? */
  requireReminderResponse: boolean;
}

export type GetClinicAppointmentSettingsResponse =
  QueryResponse<ClinicAppointmentSettingsView>;
