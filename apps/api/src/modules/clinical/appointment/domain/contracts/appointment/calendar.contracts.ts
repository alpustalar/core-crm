import { AppointmentStatusType as AppointmentStatus } from '@input-type-schemas/AppointmentStatusSchema';

export interface ClinicCalendarEvent {
  appointmentId: string;
  providerId: string;
  providerName: string | null;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  treatmentType: string | null;
  isConsultation: boolean;
}

export interface ClinicCalendarDay {
  date: string; // 'YYYY-MM-DD'
  events: ClinicCalendarEvent[];
}
