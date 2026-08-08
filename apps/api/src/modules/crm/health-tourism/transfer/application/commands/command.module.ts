import { Module } from '@nestjs/common';
import { BookTransferHandler } from './book-transfer/book-transfer.handler';
import { CancelTransferBookingHandler } from './cancel-transfer-booking/cancel-transfer-booking.handler';
import { CacheTransferRateOptionHandler } from './cache-transfer-rate-option/cache-transfer-rate-option.handler';
import { HotelbedsTransferBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.repository.module';
import { TransferCacheModule } from '../../infrastructure/cache/transfer-cache.module';
import { HotelbedsTransferApiModule } from '@modules/crm/health-tourism/transfer/infrastructure/adapters/hotelbeds/hotelbeds-transfer-api.module';

export const TRANSFER_COMMAND_HANDLERS = [
  BookTransferHandler,
  CancelTransferBookingHandler,
  CacheTransferRateOptionHandler,
];

@Module({
  imports: [
    HotelbedsTransferApiModule,
    HotelbedsTransferBookingRepositoryModule,
    TransferCacheModule,
  ],
  providers: TRANSFER_COMMAND_HANDLERS,
  exports: TRANSFER_COMMAND_HANDLERS,
})
export class TransferCommandModule {}
