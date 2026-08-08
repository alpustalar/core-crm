import { Module } from '@nestjs/common';
import { ProviderRepositoriesModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/repositories.module';
import { PROVIDER_BOOKING_SERVICE } from '@modules/clinical/provider/domain/services/provider-booking/provider-booking.service.interface';
import { ProviderBookingService } from '@modules/clinical/provider/domain/services/provider-booking/provider-booking.service';

@Module({
  imports: [ProviderRepositoriesModule],
  providers: [
    { provide: PROVIDER_BOOKING_SERVICE, useClass: ProviderBookingService },
  ],
  exports: [PROVIDER_BOOKING_SERVICE],
})
export class ProviderDomainServicesModule {}
