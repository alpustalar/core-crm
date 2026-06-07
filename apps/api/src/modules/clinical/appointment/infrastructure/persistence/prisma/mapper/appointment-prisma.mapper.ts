/* eslint-disable */
import { BookAppointmentDto } from '@shared';

interface BookAppointmentMapperInput
  extends Omit<BookAppointmentDto, 'endTime' | 'duration'> {
  endTime: Date;
}

export class AppointmentPrismaMapper {
  constructor() {}

  static toCreateInputFromBook(dto: BookAppointmentMapperInput) {
    return {
      patientName: dto.patientName,
      patientPhone: dto.patientPhone,
      patientEmail: dto.patientEmail,
      providerId: dto.providerId,
      clinicId: dto.clinicId,
      treatmentId: dto.treatmentId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      notes: dto.notes,
      externalId: dto.externalId,
      externalSystem: dto.externalSystem,
    };
  }
}
