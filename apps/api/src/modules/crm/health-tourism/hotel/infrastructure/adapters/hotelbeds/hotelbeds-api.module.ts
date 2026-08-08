import { Module } from '@nestjs/common';
import { HotelbedsApiService } from './hotelbeds-api.service';
import { HOTELBEDS_API_SERVICE } from '@modules/crm/health-tourism/hotel/domain/interfaces/hotelbeds-api.interface';

@Module({
  providers: [
    { provide: HOTELBEDS_API_SERVICE, useClass: HotelbedsApiService },
  ],
  exports: [HOTELBEDS_API_SERVICE],
})
export class HotelbedsApiModule {}
