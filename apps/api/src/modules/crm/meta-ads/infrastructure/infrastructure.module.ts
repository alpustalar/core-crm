import { Module } from '@nestjs/common';
import { MetaAdsRepositoriesModule } from '@modules/crm/meta-ads/infrastructure/persistence/prisma/repositories/repositories.module';
import { MetaAdsEventModule } from '@modules/crm/meta-ads/infrastructure/events/meta-ads-event.module';
import { MetaAdsQueueModule } from '@modules/crm/meta-ads/infrastructure/queue/meta-ads-queue.module';
import { META_ADS_CACHE_SERVICE } from '@modules/crm/meta-ads/domain/interfaces/meta-ads-cache.service.interface';
import { MetaAdsCacheService } from '@modules/crm/meta-ads/infrastructure/cache/meta-ads-cache.service';
import { MetaAdsAdaptersModule } from '@modules/crm/meta-ads/infrastructure/adapters/adapters.module';

const InfrastructureModules = [
  MetaAdsRepositoriesModule,
  MetaAdsAdaptersModule,
  MetaAdsEventModule,
  MetaAdsQueueModule,
];
@Module({
  imports: [...InfrastructureModules],
  providers: [
    { provide: META_ADS_CACHE_SERVICE, useClass: MetaAdsCacheService },
  ],
  exports: [...InfrastructureModules, META_ADS_CACHE_SERVICE],
})
export class MetaAdsInfrastructureModule {}
