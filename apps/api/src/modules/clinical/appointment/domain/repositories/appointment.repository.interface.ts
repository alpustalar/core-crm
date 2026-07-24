import { Appointment as IAppointment, Pagination } from '@shared';

import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import {
  AppointmentWithDetails,
  CancelProviderAppointmentsData,
  ClinicCalendarEventRow,
  ClinicStatusCount,
  ConflictingAppointment,
  ConflictingAppointmentView,
  FindByOrganizationIdData,
  FindClinicCalendarData,
  FindClinicCalendarEventsData,
  FindClinicDailyCountsData,
  FindConflictingAppointmentData,
  FindDueForReminderData,
  FindProviderCalendarData,
  FindUpcomingRemindersData,
  FindWaitingRoomData,
  OccupiedSlot,
  ProviderDailyLoad,
  SearchClinicAppointmentsData,
  WaitingRoomRow,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { BatchPayload } from '@common/interfaces/batcy-payload.type';
import { Paginated } from '@common/interfaces/paginated.type';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';

export const APPOINTMENT_COMMAND_REPOSITORY = Symbol(
  'IAppointmentCommandRepository'
);
export const APPOINTMENT_QUERY_REPOSITORY = Symbol(
  'IAppointmentQueryRepository'
);

export interface IAppointmentCommandRepository
  extends IBaseCommandRepository<Appointment> {
  softDeleteAllAppointmentsByClinicId(clinicId: string): Promise<BatchPayload>;
  softDeleteAllByOrganizationId(organizationId: string): Promise<BatchPayload>;
  /** Doktor-günü toplu iptal: yalnız iptal edilebilir statüler (PENDING/CONFIRMED) güncellenir. */
  cancelAllByProviderInRange(
    data: CancelProviderAppointmentsData
  ): Promise<BatchPayload>;
  /**
   * Hatırlatma penceresindeki randevuları döner. Sonuç bir mutasyona (markReminderSent
   * + save) beslendiği için command repo'dadır (CQRS write-side) ve entity döner.
   */
  findDueForReminder(data: FindDueForReminderData): Promise<Appointment[]>;
}

export interface IAppointmentQueryRepository {
  findById(appointmentId: string): Promise<IAppointment | null>;
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
  ): Promise<Paginated<IAppointment>>;
  findClinicCalendar(
    data: FindClinicCalendarData
  ): Promise<Paginated<IAppointment>>;
  /** Tam takvim (sayfasız) — aralıktaki tüm randevular, hafif projeksiyon. */
  findClinicCalendarEvents(
    data: FindClinicCalendarEventsData
  ): Promise<ClinicCalendarEventRow[]>;
  findByOrganizationId(
    data: FindByOrganizationIdData
  ): Promise<Paginated<IAppointment>>;
  findByPatientId(
    pagination: Pagination,
    patientId: string
  ): Promise<Paginated<IAppointment>>;
  findActionRequired(
    clinicId: string,
    pagination: Pagination
  ): Promise<Paginated<IAppointment>>;
  /** Resepsiyon: ad/telefon + opsiyonel status/doktor/tarih ile klinik randevu araması. */
  searchClinicAppointments(
    data: SearchClinicAppointmentsData
  ): Promise<Paginated<IAppointment>>;
  /** Resepsiyon: klinik-kapsamlı, hoursAhead içindeki onaylı yaklaşan randevular. */
  findUpcomingReminders(
    data: FindUpcomingRemindersData
  ): Promise<Paginated<IAppointment>>;
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
  ): Promise<Paginated<IAppointment>>;
}
