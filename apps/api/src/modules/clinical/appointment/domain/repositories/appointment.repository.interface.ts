import { Pagination } from '@shared';
import { Appointment as AppointmentEntity } from '@modules/clinical/appointment/domain/entities/appointment.entity';

import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import {
  AppointmentWithDetails,
  ConflictingAppointment,
  FindByOrganizationIdData,
  FindClinicCalendarData,
  FindConflictingAppointmentData,
  FindProviderCalendarData,
  OccupiedSlot,
  PaginatedAppointments,
  ProviderDailyLoad,
} from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { BatchPayload } from '@common/interfaces/batcy-payload.type';

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
    data: FindConflictingAppointmentData
  ): Promise<ConflictingAppointment | null>;
  findProviderCalendar(data: FindProviderCalendarData): PaginatedAppointments;
  findClinicCalendar(data: FindClinicCalendarData): PaginatedAppointments;
  findByOrganizationId(data: FindByOrganizationIdData): PaginatedAppointments;
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
