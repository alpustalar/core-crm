import { Module } from '@nestjs/common';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { ClinicCacheModule } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.module';
import { CLINIC_BOOKING_SERVICE } from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service.interface';
import { ClinicBookingService } from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service';

/**
 * Klinik domain servisleri.
 *
 * `TENANT_SCOPE_RESOLVER` buradan ÇIKARILDI: kesitsel bir kimlik çözümlemesi
 * olduğu için `TenantScopeModule` üzerinden `@Global` sağlanıyor. Aynı token'ı
 * burada da sağlamak ikinci bir örnek üretir ve hangisinin bağlandığı modül
 * import sırasına kalırdı.
 */
@Module({
  imports: [ClinicRepositoriesModule, ClinicCacheModule],
  providers: [
    { provide: CLINIC_BOOKING_SERVICE, useClass: ClinicBookingService },
  ],
  exports: [CLINIC_BOOKING_SERVICE],
})
export class ClinicDomainServicesModule {}
