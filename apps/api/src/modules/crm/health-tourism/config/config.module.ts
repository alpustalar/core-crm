import { Module } from '@nestjs/common';
import { HealthTourismConfigPresentationModule } from '@modules/crm/health-tourism/config/presentation/presentation.module';

/**
 * Klinik-başına sağlık-turizmi config'i (B0). Configure command + Get query'yi açar;
 * AI executor (B2/B3) GetClinicHealthTourismConfigQuery'yi bus üzerinden tüketir.
 */
@Module({ imports: [HealthTourismConfigPresentationModule] })
export class HealthTourismConfigModule {}
