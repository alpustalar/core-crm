import { Module } from '@nestjs/common';
import { CLINIC_CACHE_SERVICE } from '@modules/organization/clinic/domain/interfaces/clinic-cache.service.interface';
import { ClinicCacheService } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.service';

/**
 * Yaprak cache modülü — domain servisleri clinic altyapısının tamamını (event
 * modülü vb.) çekmeden yalnız cache'e bağlanabilsin diye ayrıldı.
 */
@Module({
  providers: [{ provide: CLINIC_CACHE_SERVICE, useClass: ClinicCacheService }],
  exports: [CLINIC_CACHE_SERVICE],
})
export class ClinicCacheModule {}
