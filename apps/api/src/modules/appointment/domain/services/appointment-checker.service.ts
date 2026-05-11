import { ConflictException, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { AppointmentRepository } from '@modules/appointment/infrastructure/persistence/prisma/repositories';
import { FindConflictingAppointmentInput } from '@modules/appointment/domain/repositories/appointment.repository.interface';

@Injectable()
export class AppointmentChecker {
  constructor(private readonly appointmentRepo: AppointmentRepository) {}

  async assertNoConflictOrThrow({
    providerId,
    startTime,
    endTime,
  }: FindConflictingAppointmentInput) {
    const conflict = await this.appointmentRepo.findConflictingAppointment({
      providerId,
      startTime,
      endTime,
    });

    if (conflict) {
      throw new ConflictException(
        `Bu doktor için seçilen saatte çakışan bir randevu mevcut: ` +
          `${format(conflict.startTime, 'HH:mm')} - ${format(conflict.endTime, 'HH:mm')}.`
      );
    }
  }
}
