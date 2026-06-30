import { Module } from '@nestjs/common';
import {
  CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY,
  CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY,
} from '@modules/crm/health-tourism/config/domain/repositories/clinic-health-tourism-config.repository';
import { ClinicHealthTourismConfigCommandRepository } from './clinic-health-tourism-config.command.repository';
import { ClinicHealthTourismConfigQueryRepository } from './clinic-health-tourism-config.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY,
      useClass: ClinicHealthTourismConfigCommandRepository,
    },
    {
      provide: CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY,
      useClass: ClinicHealthTourismConfigQueryRepository,
    },
  ],
  exports: [
    CLINIC_HEALTH_TOURISM_CONFIG_COMMAND_REPOSITORY,
    CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY,
  ],
})
export class ClinicHealthTourismConfigRepositoryModule {}
