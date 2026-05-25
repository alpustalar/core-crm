import { Module } from '@nestjs/common';
import { GetMetaReportHandler } from './get-meta-report/get-meta-report.handler';
import { GetMetaLeadsHandler } from './get-meta-leads/get-meta-leads.handler';
import { GetMetaAccountsHandler } from './get-meta-accounts/get-meta-accounts.handler';
import { MetaAdAccountRepositoryModule } from '@modules/meta-ads/infrastructure/persistence/prisma/repositories/meta-ad-account/meta-ad-account.repository.module';
import { MetaLeadRepositoryModule } from '@modules/meta-ads/infrastructure/persistence/prisma/repositories/meta-lead/meta-lead.repository.module';
import { MetaCampaignMetricRepositoryModule } from '@modules/meta-ads/infrastructure/persistence/prisma/repositories/meta-campaign-metric/meta-campaign-metric.repository.module';

export const META_ADS_QUERY_HANDLERS = [
  GetMetaReportHandler,
  GetMetaLeadsHandler,
  GetMetaAccountsHandler,
];

@Module({
  imports: [
    MetaAdAccountRepositoryModule,
    MetaLeadRepositoryModule,
    MetaCampaignMetricRepositoryModule,
  ],
  providers: META_ADS_QUERY_HANDLERS,
  exports: META_ADS_QUERY_HANDLERS,
})
export class MetaAdsQueryModule {}
