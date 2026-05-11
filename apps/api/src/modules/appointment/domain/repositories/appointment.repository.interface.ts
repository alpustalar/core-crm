import { Appointment, Prisma } from '@prisma/client';
import { Pagination } from '@shared';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';

export type IAppointment = Appointment;
export type IAppointmentStatus = AppointmentStatusType;
export type BatchPayload = { count: number };

export interface FindConflictingAppointmentInput {
  providerId: IAppointment['providerId'];
  startTime: IAppointment['startTime'];
  endTime: IAppointment['endTime'];
  ignoreAppointmentId?: IAppointment['id'];
}

export type RescheduleAppointmentInput = {
  startTime: IAppointment['startTime'];
  endTime: IAppointment['endTime'];
  providerId: IAppointment['providerId'];
  notes?: IAppointment['notes'];
  treatmentId?: IAppointment['treatmentId'];
};

export interface ConflictingAppointment {
  id: IAppointment['id'];
  startTime: IAppointment['startTime'];
  endTime: IAppointment['endTime'];
}

export interface CancelAppointmentInput {
  canceledBy: NonNullable<IAppointment['canceledBy']>;
  cancelReason?: IAppointment['cancelReason'];
}

export interface FindClinicCalendarInput {
  clinicId: IAppointment['clinicId'];
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
}

export interface FindProviderCalendarInput {
  pagination: Pagination;
  providerId: IAppointment['providerId'];
  startDate: Date;
  endDate: Date;
}

export interface FindByOrganizationIdInput {
  organizationId: string;
  pagination: Pagination;
  clinicId?: IAppointment['clinicId'];
  status?: IAppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface ProviderDailyLoad {
  providerId: string;
  date: Date;
  appointmentCount: number;
}

export interface OccupiedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: IAppointmentStatus;
}

export type PaginatedAppointments = Promise<{
  items: IAppointment[];
  total: number;
}>;

export const APPOINTMENT_REPO_TOKEN = Symbol('IAppointmentRepository');

export interface IAppointmentRepository {
  create(data: Prisma.AppointmentUncheckedCreateInput): Promise<IAppointment>;

  findById(appointmentId: IAppointment['id']): Promise<IAppointment | null>;

  findByIdWithDetails(
    appointmentId: IAppointment['id']
  ): Promise<IAppointment | null>;

  findConflictingAppointment(
    input: FindConflictingAppointmentInput
  ): Promise<ConflictingAppointment | null>;

  findProviderCalendar(input: FindProviderCalendarInput): PaginatedAppointments;

  findClinicCalendar(input: FindClinicCalendarInput): PaginatedAppointments;

  findByOrganizationId(input: FindByOrganizationIdInput): PaginatedAppointments;

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

  reschedule(
    appointmentId: IAppointment['id'],
    data: RescheduleAppointmentInput
  ): Promise<IAppointment>;

  cancelById(
    appointmentId: IAppointment['id'],
    data: CancelAppointmentInput
  ): Promise<IAppointment>;

  changeStatusById(
    appointmentId: IAppointment['id'],
    status: IAppointmentStatus
  ): Promise<IAppointment>;

  changeStatusByProviderId(
    providerId: IAppointment['providerId'],
    status: IAppointmentStatus
  ): Promise<BatchPayload>;

  changeStatusByClinicId(
    clinicId: IAppointment['clinicId'],
    status: IAppointmentStatus
  ): Promise<BatchPayload>;

  softDeleteAllAppointmentsByClinicId(
    clinicId: IAppointment['clinicId']
  ): Promise<BatchPayload>;

  softDeleteAllByOrganizationId(organizationId: string): Promise<BatchPayload>;

  softDeleteAllByProviderId(
    providerId: IAppointment['providerId']
  ): Promise<BatchPayload>;

  findProviderOccupiedSlots(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<OccupiedSlot[]>;
}
