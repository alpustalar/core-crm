import { Module } from '@nestjs/common';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { CLINIC_BOOKING_SERVICE } from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service.interface';
import { ClinicBookingService } from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service';

@Module({
  imports: [ClinicRepositoriesModule],
  providers: [
    { provide: CLINIC_BOOKING_SERVICE, useClass: ClinicBookingService },
  ],
  exports: [CLINIC_BOOKING_SERVICE],
})
export class ClinicDomainServicesModule {}
