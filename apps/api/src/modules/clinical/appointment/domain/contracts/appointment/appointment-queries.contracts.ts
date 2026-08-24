import {
  Appointment,
  Clinic,
  Pagination,
  Patient,
  Provider,
  Treatment,
  User,
} from '@shared';
import { AppointmentStatusType as AppointmentStatus } from '@input-type-schemas/AppointmentStatusSchema';

export type AppointmentWithDetails = Appointment & {
  patient: Patient | null;
  provider: (Provider & { user: User }) | null;
  treatment: Treatment | null;
  clinic: Clinic | null;
};

export interface FindByOrganizationIdData {
  organizationId: string;
  pagination: Pagination;
  clinicId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface FindProviderCalendarData {
  providerId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
}

export interface FindClinicCalendarData {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
  providerId?: string;
  status?: AppointmentStatus;
}

export interface FindClinicCalendarEventsData {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  providerId?: string;
  status?: AppointmentStatus;
}

export interface ClinicCalendarEventRow {
  id: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  treatmentType: string | null;
  isConsultation: boolean;
}

export interface SearchClinicAppointmentsData {
  clinicId: string;
  pagination: Pagination;
  search?: string;
  status?: AppointmentStatus;
  providerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface FindUpcomingRemindersData {
  clinicId: string;
  pagination: Pagination;
  hoursAhead?: number;
}

export interface FindClinicDailyCountsData {
  clinicId: string;
  providerId?: string;
  dayStart: Date;
  dayEnd: Date;
}

export interface ClinicStatusCount {
  status: AppointmentStatus;
  count: number;
}

export interface FindWaitingRoomData {
  clinicId: string;
  providerId?: string;
}

export interface WaitingRoomRow {
  id: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  checkedInAt: Date | null;
  treatmentType: string | null;
}

export interface FindDueForReminderData {
  now: Date;
  windowEnd: Date;
  limit: number;
}

export interface FindConflictingAppointmentData {
  providerId: string;
  startTime: Date;
  endTime: Date;
  ignoreAppointmentId?: string;
}

export interface CheckConflictProps {
  providerId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  ignoreAppointmentId?: string;
}

export interface ConflictingAppointment {
  id: string;
  startTime: Date;
  endTime: Date;
}

export interface OccupiedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
}

export interface ProviderDailyLoad {
  providerId: string;
  date: Date;
  appointmentCount: number;
}
