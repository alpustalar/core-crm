import { Module } from '@nestjs/common';
import { HealthTourismConfigApplicationModule } from '@modules/crm/health-tourism/config/application/application.module';
import { HealthTourismConfigInfrastructureModule } from '@modules/crm/health-tourism/config/infrastructure/infrastructure.module';
import { HealthTourismConfigPresentationModule } from '@modules/crm/health-tourism/config/presentation/presentation.module';

/**
 * Klinik-başına sağlık-turizmi config'i (B0). Configure command + Get query'yi açar;
 * AI executor (B2/B3) GetClinicHealthTourismConfigQuery'yi bus üzerinden tüketir.
 */
@Module({
  imports: [
    HealthTourismConfigApplicationModule,
    HealthTourismConfigInfrastructureModule,
    HealthTourismConfigPresentationModule,
  ],
})
export class HealthTourismConfigModule {}
