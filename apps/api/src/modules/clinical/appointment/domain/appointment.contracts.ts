import { z } from 'zod';
import {
  Appointment,
  AppointmentSchema,
  Clinic,
  Pagination,
  Patient,
  Provider,
  Treatment,
  User,
} from '@shared';
import { AppointmentStatusSchema } from '@input-type-schemas/AppointmentStatusSchema';
import { Appointment as AppointmentEntity } from '@modules/clinical/appointment/domain/entities/appointment.entity';

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .extend({
    id: z.uuid().optional(),
    providerId: z.uuid(),
    clinicId: z.uuid(),
    startTime: z.date(),
    endTime: z.date().optional(),
    patientName: z.string(),
    patientPhone: z.string(),
    patientEmail: z.email().nullable().optional(),
    duration: z.number().optional(),
    timezone: z.string().optional(),
    treatmentType: z.string().nullable().optional(),
  });

export type CreateAppointmentProps = z.infer<typeof CreateAppointmentSchema>;

// ENTITY PROP (Domain girdisi)
// TODO: Value Object'ler ekle, Omit/Extend ile özelleştirme yap
export type IAppointmentEntity = z.infer<typeof AppointmentSchema>;

// ==========================================
// REPO SORGULARI VE YARDIMCI TİPLER
// ==========================================

export type AppointmentWithDetails = Appointment & {
  patient: Patient | null;
  provider: (Provider & { user: User }) | null;
  treatment: Treatment | null;
  clinic: Clinic | null;
};

export type PaginatedAppointments = Promise<{
  items: AppointmentEntity[];
  total: number;
}>;

export type FindByOrganizationIdData = {
  organizationId: string;
  pagination: Pagination;
  clinicId?: string;
  status?: z.infer<typeof AppointmentStatusSchema>;
  startDate?: Date;
  endDate?: Date;
};

export type FindClinicCalendarData = {
  clinicId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
};

// Çakışma ve Rezervasyon Kontrol Tipleri
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

// Aksiyon / State Değişim Tipleri
export interface CancelAppointmentProps {
  canceledBy: NonNullable<string>;
  cancelReason?: string;
}

export type RescheduleAppointmentProps = {
  startTime: Date;
  endTime: Date;
  providerId: string;
  notes?: string;
  treatmentId?: string;
};

export type FindProviderCalendarData = {
  providerId: string;
  startDate: Date;
  endDate: Date;
  pagination: Pagination;
};
