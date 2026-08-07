import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigureClinicHealthTourismHandler } from './configure-clinic-health-tourism/configure-clinic-health-tourism.handler';
import { ClinicHealthTourismConfigRepositoryModule } from '@modules/crm/health-tourism/config/infrastructure/persistence/prisma/repositories/clinic-health-tourism-config/clinic-health-tourism-config.repository.module';
import {
  HealthTourismConfigInfrastructureModule
} from '@modules/crm/health-tourism/config/infrastructure/infrastructure.module';

const CommandHandlers = [ConfigureClinicHealthTourismHandler];

@Module({
  imports: [HealthTourismConfigInfrastructureModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class HealthTourismConfigCommandModule {}
