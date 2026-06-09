import { Pagination } from '@shared';
import { Appointment as AppointmentEntity } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { FindConflictingAppointmentProps } from '@modules/clinical/appointment/domain/types/find-conflicting-appointment.props';
import { ConflictingAppointment } from '@modules/clinical/appointment/domain/types/conflicting-appointment.type';
import { FindClinicCalendarProps } from '@modules/clinical/appointment/domain/types/find-calendar-clinic.props';
import { BatchPayload } from '@common/interfaces/batcy-payload.type';
import { FindByOrganizationIdProps } from '@modules/clinical/appointment/domain/types/find-by-organization-id.props';
import { FindProviderCalendarProps } from '@modules/clinical/appointment/domain/types/find-provider-calendar.props';
import { PaginatedAppointments } from '@modules/clinical/appointment/domain/types/paginated-appointments.types';
import { ProviderDailyLoad } from '@modules/clinical/appointment/domain/types/provider-dailyload.type';
import { OccupiedSlot } from '@modules/clinical/appointment/domain/types/occupied-slot.type';
import { AppointmentWithDetails } from '@modules/clinical/appointment/domain/types/appointment-with-details.type';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const APPOINTMENT_COMMAND_REPOSITORY = Symbol(
  'IAppointmentCommandRepository'
);
export const APPOINTMENT_QUERY_REPOSITORY = Symbol(
  'IAppointmentQueryRepository'
);

export interface IAppointmentCommandRepository
  extends IBaseCommandRepository<AppointmentEntity> {
  softDeleteAllAppointmentsByClinicId(clinicId: string): Promise<BatchPayload>;
  softDeleteAllByOrganizationId(organizationId: string): Promise<BatchPayload>;
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
