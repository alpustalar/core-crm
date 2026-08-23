import { Expose, Type } from 'class-transformer';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';
import { AppointmentsResponseGroups } from '@modules/clinical/appointment/domain/contracts/appointment';

const { INTERNAL, MANAGEMENT, PROVIDER_DATA_OWNER, ADMIN } =
  AppointmentsResponseGroups;

/**
 * Çakışma görünümü (ConflictingAppointmentView read-model). Çakışan aralığın
 * kendisi tabandadır — UI dolu saati göstermek için buna ihtiyaç duyar; çakışan
 * randevunun hastası klinik içi gruplara kapalıdır.
 */
export class ConflictingAppointmentResponseDto {
  @Expose() id: string;

  @Expose()
  @Type(() => Date)
  startTime: Date;

  @Expose()
  @Type(() => Date)
  endTime: Date;

  @Expose() status: AppointmentStatusType;

  @Expose({ groups: [PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT, ADMIN] })
  patientName: string;
}
