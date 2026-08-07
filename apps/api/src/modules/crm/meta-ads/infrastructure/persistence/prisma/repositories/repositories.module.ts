import { Module } from '@nestjs/common';
import { MetaAdAccountRepositoryModule } from '@modules/crm/meta-ads/infrastructure/persistence/prisma/repositories/meta-ad-account/meta-ad-account.repository.module';
import { MetaCampaignMetricRepositoryModule } from '@modules/crm/meta-ads/infrastructure/persistence/prisma/repositories/meta-campaign-metric/meta-campaign-metric.repository.module';
import { MetaLeadRepositoryModule } from '@modules/crm/meta-ads/infrastructure/persistence/prisma/repositories/meta-lead/meta-lead.repository.module';

const RepositoriesModules = [
  MetaAdAccountRepositoryModule,
  MetaCampaignMetricRepositoryModule,
  MetaLeadRepositoryModule,
];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class MetaAdsRepositoriesModule {}
