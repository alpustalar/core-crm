import { Module } from '@nestjs/common';
import { ClinicHealthTourismConfigController } from '@modules/crm/health-tourism/config/presentation/controllers/clinic-health-tourism-config.controller';
import { HealthTourismConfigApplicationModule } from '@modules/crm/health-tourism/config/application/application.module';

@Module({
  imports: [HealthTourismConfigApplicationModule],
  controllers: [ClinicHealthTourismConfigController],
})
export class HealthTourismConfigPresentationModule {}
