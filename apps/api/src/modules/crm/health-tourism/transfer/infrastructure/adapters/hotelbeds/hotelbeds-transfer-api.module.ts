import { Module } from '@nestjs/common';
import { HotelbedsTransferApiService } from './hotelbeds-transfer-api.service';
import { HOTELBEDS_TRANSFER_API_SERVICE } from '@modules/crm/health-tourism/transfer/domain/interfaces/hotelbeds-transfer-api.interface';

@Module({
  providers: [
    {
      provide: HOTELBEDS_TRANSFER_API_SERVICE,
      useClass: HotelbedsTransferApiService,
    },
  ],
  exports: [HOTELBEDS_TRANSFER_API_SERVICE],
})
export class HotelbedsTransferApiModule {}
