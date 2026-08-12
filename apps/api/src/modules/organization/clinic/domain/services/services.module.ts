import { Module } from '@nestjs/common';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { ClinicCacheModule } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.module';
import { CLINIC_BOOKING_SERVICE } from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service.interface';
import { ClinicBookingService } from '@modules/organization/clinic/domain/services/clinic-booking/clinic-booking.service';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { LocalTenantScopeResolver } from '@modules/organization/clinic/domain/services/tenant-scope/local-tenant-scope.resolver';

@Module({
  imports: [ClinicRepositoriesModule, ClinicCacheModule],
  providers: [
    { provide: CLINIC_BOOKING_SERVICE, useClass: ClinicBookingService },
    { provide: TENANT_SCOPE_RESOLVER, useClass: LocalTenantScopeResolver },
  ],
  exports: [CLINIC_BOOKING_SERVICE, TENANT_SCOPE_RESOLVER],
})
export class ClinicDomainServicesModule {}
