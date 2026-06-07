import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookHotelHandler } from './book-hotel/book-hotel.handler';
import { CancelHotelBookingHandler } from './cancel-hotel-booking/cancel-hotel-booking.handler';
import { SyncHotelContentHandler } from './sync-hotel-content/sync-hotel-content.handler';
import { HotelbedsApiModule } from '../../infrastructure/http/hotelbeds-api.module';
import { HotelbedsBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-booking/hotelbeds-booking.repository.module';
import { HotelbedsHotelRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-hotel/hotelbeds-hotel.repository.module';

export const HOTEL_COMMAND_HANDLERS = [
  BookHotelHandler,
  CancelHotelBookingHandler,
  SyncHotelContentHandler,
];

@Module({
  imports: [
    CqrsModule,
    HotelbedsApiModule,
    HotelbedsBookingRepositoryModule,
    HotelbedsHotelRepositoryModule,
  ],
  providers: HOTEL_COMMAND_HANDLERS,
  exports: HOTEL_COMMAND_HANDLERS,
})
export class HotelCommandModule {}
