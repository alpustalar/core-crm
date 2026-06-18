import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { CheckConflictProps } from '@modules/clinical/appointment/domain/types/find-conflicting-appointment.props';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';

@Injectable()
export class AppointmentChecker {
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentQueryRepo: IAppointmentQueryRepository
  ) {}

  async noConflictOrThrow({
    providerId,
    startTime,
    endTime,
    duration,
    ignoreAppointmentId,
  }: CheckConflictProps) {
    const resolvedEndTime = Appointment.calculateEndTimeOrThrow(
      startTime,
      endTime,
      duration
    );

    const conflict = await this.appointmentQueryRepo.findConflictingAppointment(
      {
        providerId,
        startTime,
        endTime: resolvedEndTime,
        ignoreAppointmentId,
      }
    );

    if (conflict) {
      throw new ConflictException(
        `Bu uzman için seçilen saatte çakışan bir randevu mevcut: ` +
          `${format(conflict.startTime, 'HH:mm')} - ${format(conflict.endTime, 'HH:mm')}.`
      );
    }
  }
}
