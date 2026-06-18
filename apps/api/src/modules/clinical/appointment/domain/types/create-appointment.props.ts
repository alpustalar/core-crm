import { ExternalSystemType as ExternalSystem } from '@input-type-schemas/ExternalSystemSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { VisitTypeType } from '@input-type-schemas/VisitTypeSchema';
import { AppointmentStatusType as AppointmentStatus } from '@input-type-schemas/AppointmentStatusSchema';

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
  visitType?: VisitTypeType | null;
  resourceId?: string | null;
  status?: AppointmentStatus;
}
