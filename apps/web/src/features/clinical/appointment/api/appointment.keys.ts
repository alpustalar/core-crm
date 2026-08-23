import type { AppointmentStatus } from '../appointment.types';

/**
 * Anahtarlar gün bazlı kurulur çünkü ekran gün bazlı: bir randevunun durumu
 * değişince yalnız o günün ajandası ve özeti geçersizleşir, tüm klinik değil.
 * `day(...)` altındaki her şey tek çağrıyla temizlenebilir.
 */
export const appointmentKeys = {
  all: ['appointments'] as const,

  days: (clinicId: string) => [...appointmentKeys.all, 'day', clinicId] as const,

  day: (
    clinicId: string,
    date: string,
    filter: { providerId?: string; status?: AppointmentStatus }
  ) => [...appointmentKeys.days(clinicId), date, filter] as const,

  summaries: (clinicId: string) =>
    [...appointmentKeys.all, 'summary', clinicId] as const,

  summary: (clinicId: string, date: string, providerId?: string) =>
    [...appointmentKeys.summaries(clinicId), date, { providerId }] as const,

  details: () => [...appointmentKeys.all, 'detail'] as const,

  detail: (appointmentId: string) =>
    [...appointmentKeys.details(), appointmentId] as const,
};
