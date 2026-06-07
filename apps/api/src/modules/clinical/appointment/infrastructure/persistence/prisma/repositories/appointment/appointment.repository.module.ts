import { Module } from '@nestjs/common';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  APPOINTMENT_QUERY_REPOSITORY,
} from '@modules/clinical/appointment/domain/repositories/appointment.repository.interface';
import { AppointmentCommandRepository } from './appointment.command.repository';
import { AppointmentQueryRepository } from './appointment.query.repository';

@Module({
  providers: [
    {
      provide: APPOINTMENT_COMMAND_REPOSITORY,
      useClass: AppointmentCommandRepository,
    },
    {
      provide: APPOINTMENT_QUERY_REPOSITORY,
      useClass: AppointmentQueryRepository,
    },
  ],
  exports: [APPOINTMENT_COMMAND_REPOSITORY, APPOINTMENT_QUERY_REPOSITORY],
})
export class AppointmentRepositoryModule {}
