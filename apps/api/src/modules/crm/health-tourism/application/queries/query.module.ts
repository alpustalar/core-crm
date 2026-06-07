import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SearchHotelsHandler } from './search-hotels/search-hotels.handler';
import { GetHotelBookingsHandler } from './get-hotel-bookings/get-hotel-bookings.handler';
import { GetHotelBookingByIdHandler } from './get-hotel-booking-by-id/get-hotel-booking-by-id.handler';
import { SearchTransferAvailabilityHandler } from './search-transfer-availability/search-transfer-availability.handler';
import { GetTransferBookingsHandler } from './get-transfer-bookings/get-transfer-bookings.handler';
import { GetTransferBookingByIdHandler } from './get-transfer-booking-by-id/get-transfer-booking-by-id.handler';
import { HotelbedsApiModule } from '../../infrastructure/http/hotelbeds-api.module';
import { HotelbedsBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-booking/hotelbeds-booking.repository.module';
import { HotelbedsTransferBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.repository.module';
import { RedisModule } from '@common/redis/redis.module';

export const HEALTH_TOURISM_QUERY_HANDLERS = [
  SearchHotelsHandler,
  GetHotelBookingsHandler,
  GetHotelBookingByIdHandler,
  SearchTransferAvailabilityHandler,
  GetTransferBookingsHandler,
  GetTransferBookingByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    HotelbedsApiModule,
    HotelbedsBookingRepositoryModule,
    HotelbedsTransferBookingRepositoryModule,
    RedisModule,
  ],
  providers: HEALTH_TOURISM_QUERY_HANDLERS,
  exports: HEALTH_TOURISM_QUERY_HANDLERS,
})
export class HealthTourismQueryModule {}
