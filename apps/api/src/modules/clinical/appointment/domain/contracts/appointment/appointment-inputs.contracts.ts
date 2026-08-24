import { AppointmentStatusType as AppointmentStatus } from '@input-type-schemas/AppointmentStatusSchema';
import { AppointmentSourceType as AppointmentSource } from '@input-type-schemas/AppointmentSourceSchema';
import { AppointmentCreatorTypeType as AppointmentCreatorType } from '@input-type-schemas/AppointmentCreatorTypeSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { VisitTypeType as VisitType } from '@input-type-schemas/VisitTypeSchema';
import { ExternalSystemType as ExternalSystem } from '@input-type-schemas/ExternalSystemSchema';
import { TimeZoneType as TimeZone } from '@input-type-schemas/TimeZoneSchema';

export interface CreateAppointmentProps {
  id?: string;
  providerId: string;
  clinicId: string;
  patientId: string;
  startTime: Date;
  endTime?: Date;
  patientName: string;
  patientPhone: string;
  patientEmail?: string | null;
  duration?: number;
  timezone: TimeZone;
  treatmentType?: string | null;
  isConsultation: boolean;

  source?: AppointmentSource;
  creatorType?: AppointmentCreatorType;
  status?: AppointmentStatus;
  examinationType?: ExaminationType | null;
  visitType?: VisitType | null;
  externalSystem?: ExternalSystem | null;
  notes?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  createdById?: string | null;
  createdByRealName?: string | null;
  checkedInAt?: Date | null;
  reminderSentAt?: Date | null;
  canceledAt?: Date | null;
  canceledBy?: string | null;
  cancelReason?: string | null;
  version?: number;
  externalId?: string | null;
  treatmentId?: string | null;
  resourceId?: string | null;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

export interface UpdateAppointmentDetailsProps {
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string | null;
  notes?: string | null;
  treatmentType?: string | null;
  treatmentId?: string | null;
  examinationType?: ExaminationType | null;
  visitType?: VisitType | null;
}

/**
 * endTime > startTime kuralı burada değil; `Appointment.reschedule()` içinden
 * çağrılan `DateRange.create()` bu invariant'ı zaten kilit kapsamında işletiyor
 * (bkz. src/domain/value-objects/date-range.vo.ts). Zod `.refine()` tekrarıydı.
 */
export interface RescheduleRequestProps {
  startTime: Date;
  endTime: Date;
  providerId: string;
  notes?: string;
  treatmentId?: string | null;
}

export type RescheduleAppointmentProps = {
  startTime: Date;
  endTime: Date;
  providerId: string;
  notes?: string;
  treatmentId?: string;
};

export type RescheduleByPatientProps = RescheduleAppointmentProps & {
  rescheduleLimitHours: number;
};

export interface CreateCancellationProps {
  canceledBy?: string | null;
  reason?: string | null;
}

export interface CancelScheduleProps {
  canceledBy: string;
  reason?: string;
}

export interface CancelAppointmentProps {
  canceledBy: NonNullable<string>;
  cancelReason?: string;
}

/**
 * endTime > startTime kuralı burada değil; `Appointment.create()` bu değeri
 * hemen `DateRange.create()`'e besliyor ve o VO invariant'ı orada kilitleniyor.
 * Zod `.refine()` tekrarıydı (hiç `.parse()` edilmiyordu).
 */
export interface CalculateEndTimeProps {
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
}

export interface AppointmentRuleSnapshot {
  id: string;
  status: AppointmentStatus;
}
