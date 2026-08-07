import { Module } from '@nestjs/common';
import { HotelbedsBookingRepositoryModule } from '@modules/crm/health-tourism/hotel/infrastructure/persistence/prisma/repositories/hotelbeds-booking/hotelbeds-booking.repository.module';
import { HotelbedsHotelRepositoryModule } from '@modules/crm/health-tourism/hotel/infrastructure/persistence/prisma/repositories/hotelbeds-hotel/hotelbeds-hotel.repository.module';

const RepositoriesModules = [
  HotelbedsBookingRepositoryModule,
  HotelbedsHotelRepositoryModule,
];

@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class HotelRepositoriesModule {}
