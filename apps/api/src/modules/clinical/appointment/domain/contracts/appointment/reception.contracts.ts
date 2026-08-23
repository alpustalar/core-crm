import { z } from 'zod';
import { AppointmentStatusSchema } from '@input-type-schemas/AppointmentStatusSchema';

export interface ClinicDailySummary {
  date: string;
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  noShow: number;
}

export interface WaitingRoomEntry {
  appointmentId: string;
  providerId: string;
  providerName: string | null;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  startTime: Date;
  checkedInAt: Date | null;
  treatmentType: string | null;
}

export interface ConflictingAppointmentView {
  id: string;
  patientName: string;
  startTime: Date;
  endTime: Date;
  status: z.infer<typeof AppointmentStatusSchema>;
}

export type CancelProviderAppointmentsData = {
  providerId: string;
  clinicId: string;
  startDate: Date;
  endDate: Date;
  canceledBy: string;
  cancelReason?: string;
};
