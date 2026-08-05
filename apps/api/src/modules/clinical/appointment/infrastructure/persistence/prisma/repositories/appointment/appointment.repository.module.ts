import { Module } from '@nestjs/common';
import { AppointmentCommandRepository } from './appointment.command.repository';
import { AppointmentQueryRepository } from './appointment.query.repository';
import { APPOINTMENT_COMMAND_REPOSITORY } from '@modules/clinical/appointment/domain/repositories/appointment/appointment.command-repository.interface';
import { APPOINTMENT_QUERY_REPOSITORY } from '@modules/clinical/appointment/domain/repositories/appointment/appointment.query-repository.interface';

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
