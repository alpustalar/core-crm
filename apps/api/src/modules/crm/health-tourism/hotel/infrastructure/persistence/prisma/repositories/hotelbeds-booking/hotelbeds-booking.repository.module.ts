import { Module } from '@nestjs/common';
import {
  HOTELBEDS_BOOKING_COMMAND_REPOSITORY,
  HOTELBEDS_BOOKING_QUERY_REPOSITORY,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking.repository.interface';
import { HotelbedsBookingCommandRepository } from './hotelbeds-booking.command.repository';
import { HotelbedsBookingQueryRepository } from './hotelbeds-booking.query.repository';

@Module({
  providers: [
    { provide: HOTELBEDS_BOOKING_COMMAND_REPOSITORY, useClass: HotelbedsBookingCommandRepository },
    { provide: HOTELBEDS_BOOKING_QUERY_REPOSITORY, useClass: HotelbedsBookingQueryRepository },
  ],
  exports: [HOTELBEDS_BOOKING_COMMAND_REPOSITORY, HOTELBEDS_BOOKING_QUERY_REPOSITORY],
})
export class HotelbedsBookingRepositoryModule {}
