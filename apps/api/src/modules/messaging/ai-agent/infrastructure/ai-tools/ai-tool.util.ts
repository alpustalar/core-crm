import { IGetPatientContext } from '@common/decorators';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import {
  AppointmentStatusSchema,
  AppointmentStatusType as AppointmentStatus,
} from '@input-type-schemas/AppointmentStatusSchema';

/** Randevu statüsü "aktif" mi (iptal/tamamlandı/gelmedi değil)? */
export function isActiveAppointmentStatus(status: AppointmentStatus): boolean {
  const inactive: AppointmentStatus[] = [
    AppointmentStatusSchema.enum.CANCELLED,
    AppointmentStatusSchema.enum.COMPLETED,
    AppointmentStatusSchema.enum.NOSHOW,
  ];
  return !inactive.includes(status);
}

/** Hasta-kapsamlı actor context üretir (patient-cancel gibi hasta kaynaklı komutlar için). */
export function createPatientActorContext({
  phone,
  patientId,
  organizationId,
  clinicId,
}: {
  phone: string;
  patientId: string;
  organizationId: string;
  clinicId: string;
}): IGetPatientContext {
  return {
    actor: { phone, patientId, organizationId, clinicId },
    source: ExecutionSources.AI_EXECUTION,
  };
}
