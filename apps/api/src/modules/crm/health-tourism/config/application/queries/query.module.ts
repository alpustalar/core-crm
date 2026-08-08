import { Module } from '@nestjs/common';
import { GetClinicHealthTourismConfigHandler } from './get-clinic-health-tourism-config/get-clinic-health-tourism-config.handler';
import { HealthTourismConfigRepositoriesModule } from '@modules/crm/health-tourism/config/infrastructure/persistence/prisma/repositories/repositories.module';

const QueryHandlers = [GetClinicHealthTourismConfigHandler];

@Module({
  imports: [HealthTourismConfigRepositoriesModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class HealthTourismConfigQueryModule {}
