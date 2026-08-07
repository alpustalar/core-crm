import { Module } from '@nestjs/common';
import { ClinicHealthTourismConfigRepositoryModule } from '@modules/crm/health-tourism/config/infrastructure/persistence/prisma/repositories/clinic-health-tourism-config/clinic-health-tourism-config.repository.module';

@Module({
  imports: [ClinicHealthTourismConfigRepositoryModule],
  exports: [ClinicHealthTourismConfigRepositoryModule],
})
export class HealthTourismConfigRepositoriesModule {}
