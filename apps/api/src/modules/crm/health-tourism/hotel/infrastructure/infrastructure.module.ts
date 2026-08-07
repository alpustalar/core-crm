import { Module } from '@nestjs/common';
import { HealthTourismQueueModule } from '@modules/crm/health-tourism/hotel/infrastructure/queue/health-tourism-queue.module';
import { HotelRepositoriesModule } from '@modules/crm/health-tourism/hotel/infrastructure/persistence/prisma/repositories/repositories.module';
import { HotelbedsApiModule } from '@modules/crm/health-tourism/hotel/infrastructure/http/hotelbeds-api.module';
import { HotelCacheModule } from '@modules/crm/health-tourism/hotel/infrastructure/cache/hotel-cache.module';

const InfrastructureModules = [
  HealthTourismQueueModule,
  HotelRepositoriesModule,
  HotelbedsApiModule,
  HotelCacheModule,
];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class HotelInfrastructureModule {}
