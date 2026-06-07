import { Module } from '@nestjs/common';
import {
  HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY,
  HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
} from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { HotelbedsTransferBookingCommandRepository } from './hotelbeds-transfer-booking.command.repository';
import { HotelbedsTransferBookingQueryRepository } from './hotelbeds-transfer-booking.query.repository';

@Module({
  providers: [
    {
      provide: HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY,
      useClass: HotelbedsTransferBookingCommandRepository,
    },
    {
      provide: HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
      useClass: HotelbedsTransferBookingQueryRepository,
    },
  ],
  exports: [
    HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY,
    HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
  ],
})
export class HotelbedsTransferBookingRepositoryModule {}
