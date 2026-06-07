import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookHotelHandler } from './book-hotel/book-hotel.handler';
import { CancelHotelBookingHandler } from './cancel-hotel-booking/cancel-hotel-booking.handler';
import { SyncHotelContentHandler } from './sync-hotel-content/sync-hotel-content.handler';
import { BookTransferHandler } from './book-transfer/book-transfer.handler';
import { CancelTransferBookingHandler } from './cancel-transfer-booking/cancel-transfer-booking.handler';
import { HotelbedsApiModule } from '../../infrastructure/http/hotelbeds-api.module';
import { HotelbedsBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-booking/hotelbeds-booking.repository.module';
import { HotelbedsHotelRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-hotel/hotelbeds-hotel.repository.module';
import { HotelbedsTransferBookingRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/hotelbeds-transfer-booking/hotelbeds-transfer-booking.repository.module';

export const HEALTH_TOURISM_COMMAND_HANDLERS = [
  BookHotelHandler,
  CancelHotelBookingHandler,
  SyncHotelContentHandler,
  BookTransferHandler,
  CancelTransferBookingHandler,
];

@Module({
  imports: [
    CqrsModule,
    HotelbedsApiModule,
    HotelbedsBookingRepositoryModule,
    HotelbedsHotelRepositoryModule,
    HotelbedsTransferBookingRepositoryModule,
  ],
  providers: HEALTH_TOURISM_COMMAND_HANDLERS,
  exports: HEALTH_TOURISM_COMMAND_HANDLERS,
})
export class HealthTourismCommandModule {}
