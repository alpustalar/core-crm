import { Module } from '@nestjs/common';
import {
  CLINIC_COMMAND_REPOSITORY,
  CLINIC_QUERY_REPOSITORY,
} from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import { ClinicCommandRepository } from './clinic.command.repository';
import { ClinicQueryRepository } from './clinic.query.repository';

@Module({
  providers: [
    { provide: CLINIC_COMMAND_REPOSITORY, useClass: ClinicCommandRepository },
    { provide: CLINIC_QUERY_REPOSITORY, useClass: ClinicQueryRepository },
  ],
  exports: [CLINIC_COMMAND_REPOSITORY, CLINIC_QUERY_REPOSITORY],
})
export class ClinicRepositoryModule {}
