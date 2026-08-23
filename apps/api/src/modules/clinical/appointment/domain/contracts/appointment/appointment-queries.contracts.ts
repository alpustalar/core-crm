import { z } from 'zod';
import {
  Appointment,
  Clinic,
  Pagination,
  Patient,
  Provider,
  Treatment,
  User,
} from '@shared';
import { AppointmentStatusSchema } from '@input-type-schemas/AppointmentStatusSchema';

export type AppointmentWithDetails = Appointment & {
  patient: Patient | null;
  provider: (Provider & { user: User }) | null;
  treatment: Treatment | null;
  clinic: Clinic | null;
};

export type FindByOrganizationIdData = {
  organizationId: string;
  pagination: Pagination;
  clinicId?: string;
  status?: z.infer<typeof AppointmentStatusSchema>;
  startDate?: Date;
  endDate?: Date;
};

export type FindProviderCalendarData = {
  providerId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
};

export type FindClinicCalendarData = {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
  providerId?: string;
  status?: z.infer<typeof AppointmentStatusSchema>;
};

export type FindClinicCalendarEventsData = {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  providerId?: string;
  status?: z.infer<typeof AppointmentStatusSchema>;
};

export type ClinicCalendarEventRow = {
  id: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  endTime: Date;
  status: z.infer<typeof AppointmentStatusSchema>;
  treatmentType: string | null;
  isConsultation: boolean;
};

export type SearchClinicAppointmentsData = {
  clinicId: string;
  pagination: Pagination;
  search?: string;
  status?: z.infer<typeof AppointmentStatusSchema>;
  providerId?: string;
  startDate?: Date;
  endDate?: Date;
};

export type FindUpcomingRemindersData = {
  clinicId: string;
  pagination: Pagination;
  hoursAhead?: number;
};

export type FindClinicDailyCountsData = {
  clinicId: string;
  providerId?: string;
  dayStart: Date;
  dayEnd: Date;
};

export type ClinicStatusCount = {
  status: z.infer<typeof AppointmentStatusSchema>;
  count: number;
};

export type FindWaitingRoomData = {
  clinicId: string;
  providerId?: string;
};

export type WaitingRoomRow = {
  id: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  checkedInAt: Date | null;
  treatmentType: string | null;
};

export type FindDueForReminderData = {
  now: Date;
  windowEnd: Date;
  limit: number;
};

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
