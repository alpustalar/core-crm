import { Module } from '@nestjs/common';
import {
  HOTELBEDS_HOTEL_COMMAND_REPOSITORY,
  HOTELBEDS_HOTEL_QUERY_REPOSITORY,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-hotel.repository.interface';
import { HotelbedsHotelCommandRepository } from './hotelbeds-hotel.command.repository';
import { HotelbedsHotelQueryRepository } from './hotelbeds-hotel.query.repository';

@Module({
  providers: [
    { provide: HOTELBEDS_HOTEL_COMMAND_REPOSITORY, useClass: HotelbedsHotelCommandRepository },
    { provide: HOTELBEDS_HOTEL_QUERY_REPOSITORY, useClass: HotelbedsHotelQueryRepository },
  ],
  exports: [HOTELBEDS_HOTEL_COMMAND_REPOSITORY, HOTELBEDS_HOTEL_QUERY_REPOSITORY],
})
export class HotelbedsHotelRepositoryModule {}
