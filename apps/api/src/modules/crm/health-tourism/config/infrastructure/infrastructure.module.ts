import { Module } from '@nestjs/common';
import { HealthTourismConfigRepositoriesModule } from '@modules/crm/health-tourism/config/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [HealthTourismConfigRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class HealthTourismConfigInfrastructureModule {}
