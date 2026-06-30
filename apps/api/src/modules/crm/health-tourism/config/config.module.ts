import { Module } from '@nestjs/common';
import { HealthTourismConfigCommandModule } from './application/commands/command.module';
import { HealthTourismConfigQueryModule } from './application/queries/query.module';
import { ClinicHealthTourismConfigController } from './presentation/controllers/clinic-health-tourism-config.controller';

/**
 * Klinik-başına sağlık-turizmi config'i (B0). Configure command + Get query'yi açar;
 * AI executor (B2/B3) GetClinicHealthTourismConfigQuery'yi bus üzerinden tüketir.
 */
@Module({
  imports: [HealthTourismConfigCommandModule, HealthTourismConfigQueryModule],
  controllers: [ClinicHealthTourismConfigController],
})
export class HealthTourismConfigModule {}
