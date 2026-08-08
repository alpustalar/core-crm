import { Module } from '@nestjs/common';
import { GetMetaReportHandler } from './get-meta-report/get-meta-report.handler';
import { GetMetaLeadsHandler } from './get-meta-leads/get-meta-leads.handler';
import { GetMetaAccountsHandler } from './get-meta-accounts/get-meta-accounts.handler';
import { GetAgencyRoiReportHandler } from './get-agency-roi-report/get-agency-roi-report.handler';
import { MetaAdsRepositoriesModule } from '@modules/crm/meta-ads/infrastructure/persistence/prisma/repositories/repositories.module';

export const META_ADS_QUERY_HANDLERS = [
  GetMetaReportHandler,
  GetMetaLeadsHandler,
  GetMetaAccountsHandler,
  GetAgencyRoiReportHandler,
];

@Module({
  imports: [MetaAdsRepositoriesModule],
  providers: META_ADS_QUERY_HANDLERS,
  exports: META_ADS_QUERY_HANDLERS,
})
export class MetaAdsQueryModule {}
