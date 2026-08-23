import { Module } from '@nestjs/common';
import { HealthTourismQueueModule } from '@modules/crm/health-tourism/hotel/infrastructure/messaging/queue/health-tourism-queue.module';
import { HotelRepositoriesModule } from '@modules/crm/health-tourism/hotel/infrastructure/persistence/prisma/repositories/repositories.module';
import { HotelCacheModule } from '@modules/crm/health-tourism/hotel/infrastructure/cache/hotel-cache.module';
import { HotelbedsApiModule } from '@modules/crm/health-tourism/hotel/infrastructure/adapters/hotelbeds/hotelbeds-api.module';
import { HotelBookingEventModule } from '@modules/crm/health-tourism/hotel/infrastructure/messaging/events/hotel-booking-event.module';

const InfrastructureModules = [
  HealthTourismQueueModule,
  HotelRepositoriesModule,
  HotelbedsApiModule,
  HotelCacheModule,
  HotelBookingEventModule,
];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class HotelInfrastructureModule {}
