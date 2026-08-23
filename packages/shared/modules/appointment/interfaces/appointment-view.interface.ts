import type { AppointmentStatusType } from '@shared/generated-zod/inputTypeSchemas/AppointmentStatusSchema';

/**
 * Randevu okuma-modelleri (entity DEĞİL). `apps/api`'deki
 * `appointment.contracts.ts` karşılıklarının sözleşme yüzü: read-model'ler HTTP
 * sınırını geçtiği için tanımları burada, iki ucun da import ettiği yerde durur.
 *
 * Tarih alanları `Date` olarak tiplenir — tel üzerinde ISO string gelir, istemci
 * `dayjs` ile okur (Lead diliminde `Lead.createdAt` ile aynı sözleşme).
 */

/**
 * `AppointmentSlotConflictException` (kod: `APPOINTMENT.ALREADY_BOOKED`, 409)
 * meta yükü. CLAUDE.md kuralı gereği burada tanımlıdır: payload'ın asıl
 * tüketicisi frontend olduğu için tip sözleşmesi tek kaynaktan gelmeli — backend
 * exception'ı da bu arayüzü import eder.
 */
export interface SlotConflictMeta extends Record<string, unknown> {
  conflictStart: string;
  conflictEnd: string;
}

/** Takvim olayı — doktor adıyla zenginleştirilmiş randevu satırı. */
export interface ClinicCalendarEvent {
  appointmentId: string;
  providerId: string;
  providerName: string | null;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatusType;
  treatmentType: string | null;
  isConsultation: boolean;
}

/** Bir güne (klinik yerelinde) ait tüm randevular. */
export interface ClinicCalendarDay {
  /** 'YYYY-MM-DD' — klinik yerel tarihi. */
  date: string;
  events: ClinicCalendarEvent[];
}

/** Günlük durum dağılımı — resepsiyon üst şeridi. */
export interface ClinicDailySummary {
  /** 'YYYY-MM-DD' — klinik yerel tarihi. */
  date: string;
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  noShow: number;
}

/** Bekleme odası — check-in yapmış, henüz tamamlanmamış randevular. */
export interface WaitingRoomEntry {
  appointmentId: string;
  providerId: string;
  providerName: string | null;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  checkedInAt: Date | null;
  treatmentType: string | null;
}
