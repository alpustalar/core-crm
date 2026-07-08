import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Kliniğin randevu davranış ayarları okuma-modeli. Satellite satırı yoksa DB
 * default'ları ile doldurulur (entity `createDefault` ile birebir). Entity değil,
 * düz veri döner — HTTP/bus sınırını güvenle geçer.
 */
export interface ClinicAppointmentSettingsView {
  clinicId: string;
  rescheduleLimitHours: number;
  cancelLimitHours: number;
  allowPatientCancel: boolean;
  requireConfirmation: boolean;
  maxFutureBookingDays: number;
}

export type GetClinicAppointmentSettingsResponse =
  QueryResponse<ClinicAppointmentSettingsView>;
