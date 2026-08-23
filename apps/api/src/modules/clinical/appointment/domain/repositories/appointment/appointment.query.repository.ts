import { Appointment, Pagination } from '@shared';
import { Paginated } from '@common/interfaces/paginated.type';
import {
  AppointmentWithDetails,
  ClinicCalendarEventRow,
  ClinicStatusCount,
  ConflictingAppointment,
  ConflictingAppointmentView,
  FindByOrganizationIdData,
  FindClinicCalendarData,
  FindClinicCalendarEventsData,
  FindClinicDailyCountsData,
  FindConflictingAppointmentData,
  FindProviderCalendarData,
  FindUpcomingRemindersData,
  FindWaitingRoomData,
  OccupiedSlot,
  ProviderDailyLoad,
  SearchClinicAppointmentsData,
  WaitingRoomRow,
} from '@modules/clinical/appointment/domain/contracts/appointment';

export const APPOINTMENT_QUERY_REPOSITORY = Symbol(
  'IAppointmentQueryRepository'
);

export interface IAppointmentQueryRepository {
  findById(appointmentId: string): Promise<Appointment | null>;
  findByIdWithDetails(
    appointmentId: string
  ): Promise<AppointmentWithDetails | null>;
  findConflictingAppointment(
    data: FindConflictingAppointmentData
  ): Promise<ConflictingAppointment | null>;
  /** Çakışma görünürlüğü: aralıkta çakışan tüm randevular (engellemez, personele gösterim). */
  findConflictingAppointments(
    data: FindConflictingAppointmentData
  ): Promise<ConflictingAppointmentView[]>;
  findProviderCalendar(
    data: FindProviderCalendarData
  ): Promise<Paginated<Appointment>>;
  findClinicCalendar(
    data: FindClinicCalendarData
  ): Promise<Paginated<Appointment>>;
  /** Tam takvim (sayfasız) — aralıktaki tüm randevular, hafif projeksiyon. */
  findClinicCalendarEvents(
    data: FindClinicCalendarEventsData
  ): Promise<ClinicCalendarEventRow[]>;
  findByOrganizationId(
    data: FindByOrganizationIdData
  ): Promise<Paginated<Appointment>>;
  findByPatientId(
    pagination: Pagination,
    patientId: string
  ): Promise<Paginated<Appointment>>;
  findActionRequired(
    clinicId: string,
    pagination: Pagination
  ): Promise<Paginated<Appointment>>;
  /** Resepsiyon: ad/telefon + opsiyonel status/doktor/tarih ile klinik randevu araması. */
  searchClinicAppointments(
    data: SearchClinicAppointmentsData
  ): Promise<Paginated<Appointment>>;
  /** Resepsiyon: klinik-kapsamlı, hoursAhead içindeki onaylı yaklaşan randevular. */
  findUpcomingReminders(
    data: FindUpcomingRemindersData
  ): Promise<Paginated<Appointment>>;
  /** Resepsiyon: bir gün için status bazlı randevu sayımları (groupBy). */
  countClinicAppointmentsByStatus(
    data: FindClinicDailyCountsData
  ): Promise<ClinicStatusCount[]>;
  getProviderDailyLoad(
    providerId: string,
    date: Date
  ): Promise<ProviderDailyLoad>;
  /** Hastanın aktif (gelecek + PENDING/CONFIRMED) randevu sayısı — maxActivePatientBookings gate'i. */
  countActiveByPatient(patientId: string): Promise<number>;
  /** Bekleme odası: kliniğe gelmiş (ARRIVED) hastalar, geliş sırasına göre. */
  findWaitingRoom(data: FindWaitingRoomData): Promise<WaitingRoomRow[]>;
  findProviderOccupiedSlots(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<OccupiedSlot[]>;
  findUpcomingPendingApproval(
    clinicId: string,
    pagination: Pagination
  ): Promise<Paginated<Appointment>>;
}
