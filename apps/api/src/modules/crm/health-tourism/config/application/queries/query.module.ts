import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetClinicHealthTourismConfigHandler } from './get-clinic-health-tourism-config/get-clinic-health-tourism-config.handler';
import { ClinicHealthTourismConfigRepositoryModule } from '@modules/crm/health-tourism/config/infrastructure/persistence/prisma/repositories/clinic-health-tourism-config/clinic-health-tourism-config.repository.module';

const QueryHandlers = [GetClinicHealthTourismConfigHandler];

@Module({
  imports: [CqrsModule, ClinicHealthTourismConfigRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class HealthTourismConfigQueryModule {}
