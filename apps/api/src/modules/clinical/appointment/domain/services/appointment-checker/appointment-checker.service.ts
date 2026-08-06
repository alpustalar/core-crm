import { Inject, Injectable } from '@nestjs/common';

import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { IAppointmentCheckerService } from '@modules/clinical/appointment/domain/services/appointment-checker/appointment-checker.service.interface';
import {
  APPOINTMENT_QUERY_REPOSITORY,
  IAppointmentQueryRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';
import { CheckConflictProps } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { AppointmentSlotConflictException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

@Injectable()
export class AppointmentCheckerService implements IAppointmentCheckerService {
  constructor(
    @Inject(APPOINTMENT_QUERY_REPOSITORY)
    private readonly appointmentRepo: IAppointmentQueryRepository
  ) {}

  async assertNoConflict({
    providerId,
    startTime,
    endTime: _endTime,
    duration,
    ignoreAppointmentId,
  }: CheckConflictProps) {
    const endTime = Appointment.calculateEndTime({
      startTime,
      endTime: _endTime,
      duration,
    }).orThrow();

    const conflict = await this.appointmentRepo.findConflictingAppointment({
      providerId,
      startTime,
      endTime,
      ignoreAppointmentId,
    });

    if (conflict) {
      throw new AppointmentSlotConflictException(
        conflict.startTime,
        conflict.endTime
      );
    }
  }
}
