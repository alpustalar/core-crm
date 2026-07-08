import { z } from 'zod';
import {
  Appointment,
  AppointmentSchema,
  Clinic,
  Pagination,
  Patient,
  Provider,
  TimeZoneSchema,
  Treatment,
  User,
} from '@shared';
import { AppointmentStatusSchema } from '@input-type-schemas/AppointmentStatusSchema';
import { Appointment as AppointmentEntity } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { ResponseGroups } from '@common/constants/response-groups.constant';

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .extend({
    id: z.uuid().optional(),
    providerId: z.uuid(),
    clinicId: z.uuid(),
    startTime: z.date(),
    endTime: z.date().optional(),
    patientName: z.string(),
    patientPhone: z.string(),
    patientEmail: z.email().nullable().optional(),
    duration: z.number().optional(),
    timezone: TimeZoneSchema,
    treatmentType: z.string().nullable().optional(),
    isConsultation: z.boolean(),
  });

export type CreateAppointmentProps = z.infer<typeof CreateAppointmentSchema>;

export type IAppointmentEntity = z.infer<typeof AppointmentSchema>;

// ==========================================
// REPO SORGULARI VE YARDIMCI TİPLER
// ==========================================

export type AppointmentWithDetails = Appointment & {
  patient: Patient | null;
  provider: (Provider & { user: User }) | null;
  treatment: Treatment | null;
  clinic: Clinic | null;
};

export type PaginatedAppointments = Promise<{
  items: AppointmentEntity[];
  total: number;
}>;

export type FindByOrganizationIdData = {
  organizationId: string;
  pagination: Pagination;
  clinicId?: string;
  status?: z.infer<typeof AppointmentStatusSchema>;
  startDate?: Date;
  endDate?: Date;
};

export type FindClinicCalendarData = {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
};

// Çakışma ve Rezervasyon Kontrol Tipleri
export type FindConflictingAppointmentData = {
  providerId: string;
  startTime: Date;
  endTime: Date;
  ignoreAppointmentId?: string;
};

export type CheckConflictProps = {
  providerId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  ignoreAppointmentId?: string;
};

export type ConflictingAppointment = {
  id: string;
  startTime: Date;
  endTime: Date;
};

export interface OccupiedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: z.infer<typeof AppointmentStatusSchema>;
}

export interface ProviderDailyLoad {
  providerId: string;
  date: Date;
  appointmentCount: number;
}

// Açık slot önerisi (AI asistanı) — yerel tarih bazında hazır boş slotlar
export interface FindProviderOpenSlotsInput {
  providerId: string;
  clinicId: string;
  /** Klinik yerel saatinde gün (YYYY-MM-DD). */
  date: string;
  /** Randevu süresi (dakika); slot adımı bu değerdir. */
  durationMinutes: number;
}

export interface OpenSlot {
  /** Klinik yerel saatinde başlangıç etiketi (HH:mm) — hastaya sunmaya hazır. */
  time: string;
  /** Tam UTC anı — booking doğrudan bunu kullanabilir. */
  start: Date;
  durationMinutes: number;
}

// Aksiyon / State Değişim Tipleri
export interface CancelAppointmentProps {
  canceledBy: NonNullable<string>;
  cancelReason?: string;
}

export type RescheduleAppointmentProps = {
  startTime: Date;
  endTime: Date;
  providerId: string;
  notes?: string;
  treatmentId?: string;
};

// Hasta (Patient) erteleme girişi — klinik ayarındaki (ClinicAppointmentSettings)
// erteleme saat sınırı entity'ye handler tarafından geçirilir.
export type RescheduleByPatientProps = RescheduleAppointmentProps & {
  rescheduleLimitHours: number;
};

export type FindProviderCalendarData = {
  providerId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
};

// eslint-disable-next-line
const { DATA_OWNER, ...Groups } = ResponseGroups;
export const AppointmentsResponseGroups = {
  ...Groups,
  PROVIDER_DATA_OWNER: 'PROVIDER_DATA_OWNER',
  PATIENT_DATA_OWNER: 'PATIENT_DATA_OWNER',
} as const;

export type AppointmentResponseGroup =
  (typeof AppointmentsResponseGroups)[keyof typeof AppointmentsResponseGroups];

export const CreateCancellationPropsSchema = z.object({
  canceledAt: z.date(),
  canceledBy: z.uuid(),
  reason: z.string().nullable().optional(),
});

export type CreateCancellationProps = z.infer<
  typeof CreateCancellationPropsSchema
>;
