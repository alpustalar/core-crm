import { Module } from '@nestjs/common';
import { HotelbedsApiService } from './hotelbeds-api.service';
import { HOTELBEDS_API_SERVICE } from '@modules/crm/health-tourism/domain/interfaces/hotelbeds-api.interface';
import { HotelbedsTransferApiService } from './hotelbeds-transfer-api.service';
import { HOTELBEDS_TRANSFER_API_SERVICE } from '@modules/crm/health-tourism/domain/interfaces/hotelbeds-transfer-api.interface';

@Module({
  providers: [
    { provide: HOTELBEDS_API_SERVICE, useClass: HotelbedsApiService },
    {
      provide: HOTELBEDS_TRANSFER_API_SERVICE,
      useClass: HotelbedsTransferApiService,
    },
  ],
  exports: [HOTELBEDS_API_SERVICE, HOTELBEDS_TRANSFER_API_SERVICE],
})
export class HotelbedsApiModule {}
