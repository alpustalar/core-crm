import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SearchHotelsHandler } from './search-hotels/search-hotels.handler';
import { GetHotelBookingsHandler } from './get-hotel-bookings/get-hotel-bookings.handler';
import { GetHotelBookingByIdHandler } from './get-hotel-booking-by-id/get-hotel-booking-by-id.handler';
import { HotelbedsApiModule } from '../../infrastructure/http/hotelbeds-api.module';
import { HotelbedsBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-booking/hotelbeds-booking.repository.module';
import { RedisModule } from '@src/infrastructure/cache/redis/redis.module';

export const HOTEL_QUERY_HANDLERS = [
  SearchHotelsHandler,
  GetHotelBookingsHandler,
  GetHotelBookingByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    HotelbedsApiModule,
    HotelbedsBookingRepositoryModule,
    RedisModule,
  ],
  providers: HOTEL_QUERY_HANDLERS,
  exports: HOTEL_QUERY_HANDLERS,
})
export class HotelQueryModule {}
