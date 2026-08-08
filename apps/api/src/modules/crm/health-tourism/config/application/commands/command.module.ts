import { Module } from '@nestjs/common';
import { ConfigureClinicHealthTourismHandler } from './configure-clinic-health-tourism/configure-clinic-health-tourism.handler';
import { HealthTourismConfigInfrastructureModule } from '@modules/crm/health-tourism/config/infrastructure/infrastructure.module';

const CommandHandlers = [ConfigureClinicHealthTourismHandler];

@Module({
  imports: [HealthTourismConfigInfrastructureModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class HealthTourismConfigCommandModule {}
