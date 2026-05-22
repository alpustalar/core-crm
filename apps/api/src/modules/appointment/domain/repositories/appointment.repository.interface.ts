import { Prisma } from '@prisma/client';
import { Pagination } from '@shared';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';
import { Appointment as AppointmentEntity } from '@modules/appointment/domain/entities/appointment.entity';
import { FindConflictingAppointmentProps } from '@modules/appointment/domain/types/find-conflicting-appointment.props';
import { ConflictingAppointment } from '@modules/appointment/domain/types/conflicting-appointment.type';
import { FindClinicCalendarProps } from '@modules/appointment/domain/types/find-calendar-clinic.props';
import { BatchPayload } from '@common/interfaces/batcy-payload.type';
import { FindByOrganizationIdProps } from '@modules/appointment/domain/types/find-by-organization-id.props';
import { FindProviderCalendarProps } from '@modules/appointment/domain/types/find-provider-calendar.props';
import { PaginatedAppointments } from '@modules/appointment/domain/types/paginated-appointments.types';
import { ProviderDailyLoad } from '@modules/appointment/domain/types/provider-dailyload.type';
import { RescheduleAppointmentProps } from '@modules/appointment/domain/types/reschedule-appointment.props';
import { CancelAppointmentProps } from '@modules/appointment/domain/types/cancel-appointment.props';
import { OccupiedSlot } from '@modules/appointment/domain/types/occupied-slot.type';
import { AppointmentWithDetails } from '@modules/appointment/domain/types/appointment-with-details.type';

export const APPOINTMENT_COMMAND_REPOSITORY = Symbol(
  'IAppointmentCommandRepository'
);
export const APPOINTMENT_QUERY_REPOSITORY = Symbol(
  'IAppointmentQueryRepository'
);

export interface IAppointmentCommandRepository {
  create(
    data: Prisma.AppointmentUncheckedCreateInput
  ): Promise<AppointmentEntity>;
  reschedule(
    appointmentId: string,
    data: RescheduleAppointmentProps
  ): Promise<AppointmentEntity>;
  cancelById(
    appointmentId: string,
    data: CancelAppointmentProps
  ): Promise<AppointmentEntity>;
  changeStatusById(
    appointmentId: string,
    status: AppointmentStatusType
  ): Promise<AppointmentEntity>;
  changeStatusByProviderId(
    providerId: string,
    status: AppointmentStatusType
  ): Promise<BatchPayload>;
  changeStatusByClinicId(
    clinicId: string,
    status: AppointmentStatusType
  ): Promise<BatchPayload>;
  softDeleteAllAppointmentsByClinicId(clinicId: string): Promise<BatchPayload>;
  softDeleteAllByOrganizationId(organizationId: string): Promise<BatchPayload>;
  softDeleteAllByProviderId(providerId: string): Promise<BatchPayload>;
  save(appointment: AppointmentEntity): Promise<void>;
}

export interface IAppointmentQueryRepository {
  findById(appointmentId: string): Promise<AppointmentEntity | null>;
  findByIdWithDetails(
    appointmentId: string
  ): Promise<AppointmentWithDetails | null>;
  findConflictingAppointment(
    props: FindConflictingAppointmentProps
  ): Promise<ConflictingAppointment | null>;
  findProviderCalendar(props: FindProviderCalendarProps): PaginatedAppointments;
  findClinicCalendar(props: FindClinicCalendarProps): PaginatedAppointments;
  findByOrganizationId(props: FindByOrganizationIdProps): PaginatedAppointments;
  findByPatientId(
    pagination: Pagination,
    patientId: string
  ): PaginatedAppointments;
  findActionRequired(
    clinicId: string,
    pagination: Pagination
  ): PaginatedAppointments;
  findUpcomingReminders(
    pagination: Pagination,
    hoursAhead?: number
  ): PaginatedAppointments;
  getProviderDailyLoad(
    providerId: string,
    date: Date
  ): Promise<ProviderDailyLoad>;
  findProviderOccupiedSlots(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<OccupiedSlot[]>;
}
