import { Global, Module } from '@nestjs/common';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { ClinicCacheModule } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.module';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { LocalTenantScopeResolver } from '@modules/organization/clinic/domain/services/tenant-scope/local-tenant-scope.resolver';

/**
 * Kiracı kapsamı çözücüsü `@Global` sağlanır.
 *
 * Gerekçe: `clinicId → organizationId` çözümlemesi iş verisi değil, neredeyse her
 * yazma işleminin başında gereken KİMLİK bilgisidir — hâlihazırda 15+ modülde
 * kullanılıyor. Her tüketicinin sahibin servis modülünü import etmesi, tek bir
 * skaler çözümleme için modül grafiğine 17 gereksiz kenar ekliyordu.
 *
 * `TransactionManager`'ın `PrismaModule` üzerinden global sağlanmasıyla aynı
 * gerekçe: kesitsel (cross-cutting) altyapı.
 *
 * `CLINIC_BOOKING_SERVICE` bilerek DIŞARIDA bırakıldı — o bir iş kuralı kapısıdır
 * ve yalnız iki modül kullanır; global'e alınması sınırları gereksiz gevşetirdi.
 * O `ClinicDomainServicesModule`'da kalmaya devam eder.
 *
 * Clinic başka bir servise taşındığında burada yalnız `useClass` değişir
 * (in-process → NATS/HTTP adapter); tüketici handler'lar aynı kalır.
 */
@Global()
@Module({
  imports: [ClinicRepositoriesModule, ClinicCacheModule],
  providers: [
    { provide: TENANT_SCOPE_RESOLVER, useClass: LocalTenantScopeResolver },
  ],
  exports: [TENANT_SCOPE_RESOLVER],
})
export class TenantScopeModule {}
