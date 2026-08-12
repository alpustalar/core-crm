import { Expose, Type } from 'class-transformer';

import { AppointmentsResponseGroups } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { TimeZone } from '@src/domain/value-objects/timezone.vo';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';
import { AppointmentSourceType } from '@input-type-schemas/AppointmentSourceSchema';
import { VisitTypeType } from '@input-type-schemas/VisitTypeSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { AppointmentCreatorTypeType as AppointmentCreatorType } from '@input-type-schemas/AppointmentCreatorTypeSchema';

const { PROVIDER_DATA_OWNER, PATIENT_DATA_OWNER, INTERNAL, ADMIN, MANAGEMENT } =
  AppointmentsResponseGroups;

const PATIENT_SHARED = {
  groups: [
    INTERNAL,
    PROVIDER_DATA_OWNER,
    PATIENT_DATA_OWNER,
    ADMIN,
    MANAGEMENT,
  ],
};

const INTERNAL_ONLY = {
  groups: [INTERNAL, PROVIDER_DATA_OWNER, ADMIN, MANAGEMENT],
};

const MANAGEMENT_ONLY = { groups: [MANAGEMENT, ADMIN] };

export class AppointmentRelationalDto {
  @Expose() id: string;
}

export class AppointmentResponseDto {
  // --------------------
  // Core & Identification (Herkes Görebilir)
  // --------------------
  @Expose()
  id: string;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  status: AppointmentStatusType;

  @Expose()
  timezone: TimeZone;

  @Expose()
  isConsultation: boolean;

  // --------------------
  // Patient Info (Hasta, Hekim ve Klinik Personeli Görebilir)
  // --------------------
  @Expose(PATIENT_SHARED)
  patientName: string;

  @Expose(PATIENT_SHARED)
  patientPhone: string;

  @Expose(PATIENT_SHARED)
  patientEmail?: string;

  // --------------------
  // Operational Details (Klinik İçi, Hekim ve Yönetim)
  // --------------------
  @Expose(INTERNAL_ONLY)
  source: AppointmentSourceType;

  @Expose(INTERNAL_ONLY)
  treatmentType?: string;

  @Expose(INTERNAL_ONLY)
  examinationType?: ExaminationType;

  @Expose(INTERNAL_ONLY)
  visitType?: VisitTypeType;

  @Expose(INTERNAL_ONLY)
  notes?: string;

  // --------------------
  // Audit & Creation Logs (Sadece Personel ve Yönetim)
  // --------------------
  @Expose(INTERNAL_ONLY)
  creatorType: AppointmentCreatorType;

  @Expose(INTERNAL_ONLY)
  createdById?: string;

  @Expose(INTERNAL_ONLY)
  createdByRealName?: string;

  @Expose(INTERNAL_ONLY)
  approvedAt?: Date;

  @Expose({ groups: [ADMIN] })
  approvedBy?: string;

  @Expose(INTERNAL_ONLY)
  checkedInAt?: Date;

  @Expose(INTERNAL_ONLY)
  reminderSentAt?: Date;

  // --------------------
  // Cancellation Logs (Sadece Klinik İçi ve Yönetim)
  // --------------------
  @Expose(INTERNAL_ONLY)
  canceledAt?: Date;

  @Expose(INTERNAL_ONLY)
  canceledBy?: string;

  @Expose(INTERNAL_ONLY)
  cancelReason?: string;

  // --------------------
  // System Timestamps
  // --------------------
  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // --------------------
  // Relational IDs
  // --------------------
  @Expose() clinicId: string;
  @Expose() providerId: string;
  @Expose() patientId: string;

  @Expose(INTERNAL_ONLY) treatmentId?: string;
  @Expose(INTERNAL_ONLY) resourceId?: string;
  @Expose({ groups: [INTERNAL, ADMIN] }) externalId?: string;
  @Expose({ groups: [INTERNAL, ADMIN] }) externalSystem?: string;

  // --------------------
  // Relational Object Hydrations (İlişkili Sınıflar)
  // --------------------
  @Expose()
  @Type(() => AppointmentRelationalDto)
  clinic: AppointmentRelationalDto;

  @Expose()
  @Type(() => AppointmentRelationalDto)
  provider: AppointmentRelationalDto;

  @Expose(INTERNAL_ONLY)
  @Type(() => AppointmentRelationalDto)
  patient: AppointmentRelationalDto;

  @Expose(INTERNAL_ONLY)
  @Type(() => AppointmentRelationalDto)
  treatment?: AppointmentRelationalDto;

  @Expose(INTERNAL_ONLY)
  @Type(() => AppointmentRelationalDto)
  resource?: AppointmentRelationalDto;

  @Expose(INTERNAL_ONLY)
  @Type(() => AppointmentRelationalDto)
  payment?: AppointmentRelationalDto[];

  @Expose(INTERNAL_ONLY)
  @Type(() => AppointmentRelationalDto)
  invoice?: AppointmentRelationalDto[];

  @Expose(INTERNAL_ONLY)
  @Type(() => AppointmentRelationalDto)
  posTransactions?: AppointmentRelationalDto[];
}
