import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { CheckConflictProps } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

@Injectable()
export class AppointmentCheckerService {
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentQueryRepo: IAppointmentQueryRepository
  ) {}

  async assertNoConflict({
    providerId,
    startTime,
    endTime,
    duration,
    ignoreAppointmentId,
  }: CheckConflictProps) {
    const resolvedEndTime = Appointment.calculateEndTime(
      startTime,
      endTime,
      duration
    ).orThrow();

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
