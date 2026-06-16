import { Module } from '@nestjs/common';
import {
  CLINIC_GOVERNMENT_SPECS_COMMAND_REPOSITORY,
  CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY,
} from '@modules/platform/governance/domain/repositories/clinic-government-specs.repository';
import { ClinicGovernmentSpecsCommandRepository } from './clinic-government-specs.command.repository';
import { ClinicGovernmentSpecsQueryRepository } from './clinic-government-specs.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_GOVERNMENT_SPECS_COMMAND_REPOSITORY,
      useClass: ClinicGovernmentSpecsCommandRepository,
    },
    {
      provide: CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY,
      useClass: ClinicGovernmentSpecsQueryRepository,
    },
  ],
  exports: [
    CLINIC_GOVERNMENT_SPECS_COMMAND_REPOSITORY,
    CLINIC_GOVERNMENT_SPECS_QUERY_REPOSITORY,
  ],
})
export class ClinicGovernmentSpecsRepositoryModule {}
