import { Module } from '@nestjs/common';
import { ClinicHealthTourismConfigQueryController } from '@modules/crm/health-tourism/config/presentation/http/controllers/clinic-health-tourism-config.query.controller';
import { ClinicHealthTourismConfigCommandController } from '@modules/crm/health-tourism/config/presentation/http/controllers/clinic-health-tourism-config.command.controller';

@Module({
  controllers: [
    ClinicHealthTourismConfigQueryController,
    ClinicHealthTourismConfigCommandController,
  ],
})
export class HealthTourismConfigPresentationModule {}
