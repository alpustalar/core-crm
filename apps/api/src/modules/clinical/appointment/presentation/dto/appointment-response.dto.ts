import { Expose, Type } from 'class-transformer';

import { AppointmentsResponseGroups } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { TimeZone } from '@src/domain/value-objects/timezone.vo';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';
import { AppointmentSourceType } from '@input-type-schemas/AppointmentSourceSchema';
import { VisitTypeType } from '@input-type-schemas/VisitTypeSchema';
import { ExaminationTypeType as ExaminationType } from '@input-type-schemas/ExaminationTypeSchema';
import { AppointmentCreatorTypeType as AppointmentCreatorType } from '@input-type-schemas/AppointmentCreatorTypeSchema';

const {
  MANAGEMENT,
  PROVIDER_DATA_OWNER,
  PATIENT_DATA_OWNER,
  INTERNAL,
  FINANCIAL,
} = AppointmentsResponseGroups;

// İlişkili modeller için yalın alt DTO'lar
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
  @Expose({
    groups: [PATIENT_DATA_OWNER, PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT],
  })
  patientName: string;

  @Expose({
    groups: [PATIENT_DATA_OWNER, PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT],
  })
  patientPhone: string;

  @Expose({
    groups: [PATIENT_DATA_OWNER, PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT],
  })
  patientEmail?: string;

  // --------------------
  // Operational Details (Klinik İçi, Hekim ve Yönetim)
  // --------------------
  @Expose({ groups: [PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT] })
  source: AppointmentSourceType;

  @Expose({ groups: [PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT] })
  treatmentType?: string;

  @Expose({ groups: [PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT] })
  examinationType?: ExaminationType;

  @Expose({ groups: [PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT] })
  visitType?: VisitTypeType;

  @Expose({ groups: [PROVIDER_DATA_OWNER, INTERNAL, MANAGEMENT] })
  notes?: string;

  // --------------------
  // Audit & Creation Logs (Sadece Personel ve Yönetim)
  // --------------------
  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  creatorType: AppointmentCreatorType;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  createdById?: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  createdByRealName?: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  approvedAt?: Date;

  @Expose({ groups: [MANAGEMENT] })
  approvedBy?: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  checkedInAt?: Date;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  reminderSentAt?: Date;

  // --------------------
  // Cancellation Logs (Sadece Klinik İçi ve Yönetim)
  // --------------------
  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  canceledAt?: Date;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  canceledBy?: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  cancelReason?: string;

  // --------------------
  // System Timestamps
  // --------------------
  @Expose({ groups: [MANAGEMENT] })
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT] })
  updatedAt: Date;

  // --------------------
  // Relational IDs
  // --------------------
  @Expose() clinicId: string;
  @Expose() providerId: string;
  @Expose() patientId: string;

  @Expose({ groups: [INTERNAL, MANAGEMENT] }) treatmentId?: string;
  @Expose({ groups: [INTERNAL, MANAGEMENT] }) resourceId?: string;
  @Expose({ groups: [MANAGEMENT] }) externalId?: string;
  @Expose({ groups: [MANAGEMENT] }) externalSystem?: string;

  // --------------------
  // Relational Object Hydrations (İlişkili Sınıflar)
  // --------------------
  @Expose()
  @Type(() => AppointmentRelationalDto)
  clinic: AppointmentRelationalDto;

  @Expose()
  @Type(() => AppointmentRelationalDto)
  provider: AppointmentRelationalDto;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  @Type(() => AppointmentRelationalDto)
  patient: AppointmentRelationalDto;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  @Type(() => AppointmentRelationalDto)
  treatment?: AppointmentRelationalDto;

  @Expose({ groups: [INTERNAL, MANAGEMENT] })
  @Type(() => AppointmentRelationalDto)
  resource?: AppointmentRelationalDto;

  @Expose({ groups: [FINANCIAL, MANAGEMENT] })
  @Type(() => AppointmentRelationalDto)
  payment?: AppointmentRelationalDto[];

  @Expose({ groups: [FINANCIAL, MANAGEMENT] })
  @Type(() => AppointmentRelationalDto)
  invoice?: AppointmentRelationalDto[];

  @Expose({ groups: [FINANCIAL, MANAGEMENT] })
  @Type(() => AppointmentRelationalDto)
  posTransactions?: AppointmentRelationalDto[];
}
