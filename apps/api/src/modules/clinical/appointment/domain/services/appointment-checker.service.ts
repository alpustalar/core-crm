import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { FindConflictingAppointmentProps } from '@modules/clinical/appointment/domain/types/find-conflicting-appointment.props';

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
  }: FindConflictingAppointmentProps) {
    const conflict = await this.appointmentQueryRepo.findConflictingAppointment(
      {
        providerId,
        startTime,
        endTime,
      }
    );

    if (conflict) {
      throw new ConflictException(
        `Bu doktor için seçilen saatte çakışan bir randevu mevcut: ` +
          `${format(conflict.startTime, 'HH:mm')} - ${format(conflict.endTime, 'HH:mm')}.`
      );
    }
  }
}
