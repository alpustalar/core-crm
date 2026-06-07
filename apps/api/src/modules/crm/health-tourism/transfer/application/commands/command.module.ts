import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookTransferHandler } from './book-transfer/book-transfer.handler';
import { CancelTransferBookingHandler } from './cancel-transfer-booking/cancel-transfer-booking.handler';
import { HotelbedsTransferApiModule } from '../../infrastructure/http/hotelbeds-transfer-api.module';
import { HotelbedsTransferBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.repository.module';

export const TRANSFER_COMMAND_HANDLERS = [
  BookTransferHandler,
  CancelTransferBookingHandler,
];

@Module({
  imports: [
    CqrsModule,
    HotelbedsTransferApiModule,
    HotelbedsTransferBookingRepositoryModule,
  ],
  providers: TRANSFER_COMMAND_HANDLERS,
  exports: TRANSFER_COMMAND_HANDLERS,
})
export class TransferCommandModule {}
