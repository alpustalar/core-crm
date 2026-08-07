import { Module } from '@nestjs/common';
import { BookHotelHandler } from './book-hotel/book-hotel.handler';
import { CancelHotelBookingHandler } from './cancel-hotel-booking/cancel-hotel-booking.handler';
import { SyncHotelContentHandler } from './sync-hotel-content/sync-hotel-content.handler';
import { CacheHotelRateOptionHandler } from './cache-hotel-rate-option/cache-hotel-rate-option.handler';
import { HotelInfrastructureModule } from '@modules/crm/health-tourism/hotel/infrastructure/infrastructure.module';

export const HOTEL_COMMAND_HANDLERS = [
  BookHotelHandler,
  CancelHotelBookingHandler,
  SyncHotelContentHandler,
  CacheHotelRateOptionHandler,
];

@Module({
  imports: [HotelInfrastructureModule],
  providers: HOTEL_COMMAND_HANDLERS,
  exports: HOTEL_COMMAND_HANDLERS,
})
export class HotelCommandModule {}
