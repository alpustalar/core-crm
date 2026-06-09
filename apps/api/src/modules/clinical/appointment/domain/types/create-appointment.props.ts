import {
  AppointmentStatus,
  ExaminationType,
  ExternalSystem,
  VisitType,
} from '@prisma/client';

export interface CreateAppointmentProps {
  id?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string | null;
  patientId?: string | null;
  providerId: string;
  clinicId: string;
  treatmentId?: string | null;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  timezone?: string;
  notes?: string | null;
  treatmentType?: string | null;
  externalSystem?: ExternalSystem | null;
  externalId?: string | null;
  examinationType?: ExaminationType | null;
  visitType?: VisitType | null;
  resourceId?: string | null;
  status?: AppointmentStatus;
}
