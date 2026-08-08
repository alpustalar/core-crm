import { Module } from '@nestjs/common';

import { ClinicCommandRepository } from './clinic.command.repository';
import { ClinicQueryRepository } from './clinic.query.repository';
import { CLINIC_COMMAND_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic/clinic.command.repository';
import { CLINIC_QUERY_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository';

@Module({
  providers: [
    { provide: CLINIC_COMMAND_REPOSITORY, useClass: ClinicCommandRepository },
    { provide: CLINIC_QUERY_REPOSITORY, useClass: ClinicQueryRepository },
  ],
  exports: [CLINIC_COMMAND_REPOSITORY, CLINIC_QUERY_REPOSITORY],
})
export class ClinicRepositoryModule {}
