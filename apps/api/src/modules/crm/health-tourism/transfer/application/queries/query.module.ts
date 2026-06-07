import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SearchTransferAvailabilityHandler } from './search-transfer-availability/search-transfer-availability.handler';
import { GetTransferBookingsHandler } from './get-transfer-bookings/get-transfer-bookings.handler';
import { GetTransferBookingByIdHandler } from './get-transfer-booking-by-id/get-transfer-booking-by-id.handler';
import { HotelbedsTransferApiModule } from '../../infrastructure/http/hotelbeds-transfer-api.module';
import { HotelbedsTransferBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.repository.module';
import { RedisModule } from '@common/redis/redis.module';

export const TRANSFER_QUERY_HANDLERS = [
  SearchTransferAvailabilityHandler,
  GetTransferBookingsHandler,
  GetTransferBookingByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    HotelbedsTransferApiModule,
    HotelbedsTransferBookingRepositoryModule,
    RedisModule,
  ],
  providers: TRANSFER_QUERY_HANDLERS,
  exports: TRANSFER_QUERY_HANDLERS,
})
export class TransferQueryModule {}
