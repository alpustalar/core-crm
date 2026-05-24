import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConnectMetaAccountHandler } from './connect-meta-account/connect-meta-account.handler';
import { SyncCampaignMetricsHandler } from './sync-campaign-metrics/sync-campaign-metrics.handler';
import { ProcessMetaLeadHandler } from './process-meta-lead/process-meta-lead.handler';
import { MatchLeadToPatientHandler } from './match-lead-to-patient/match-lead-to-patient.handler';
import { HandleMetaOAuthCallbackHandler } from './handle-meta-oauth-callback/handle-meta-oauth-callback.handler';
import { MetaAdAccountRepositoryModule } from '@modules/meta-ads/infrastructure/persistence/prisma/repositories/meta-ad-account/meta-ad-account.repository.module';
import { MetaLeadRepositoryModule } from '@modules/meta-ads/infrastructure/persistence/prisma/repositories/meta-lead/meta-lead.repository.module';
import { MetaCampaignMetricRepositoryModule } from '@modules/meta-ads/infrastructure/persistence/prisma/repositories/meta-campaign-metric/meta-campaign-metric.repository.module';
import { MetaAdsEventModule } from '@modules/meta-ads/infrastructure/events/meta-ads-event.module';
import { MetaMarketingApiService } from '@modules/meta-ads/infrastructure/http/meta-marketing-api.service';
import { TokenCipherService } from '@modules/meta-ads/infrastructure/crypto/token-cipher.service';
import { PatientQueryModule } from '@modules/patient/application/queries/query.module';
import { RedisModule } from '@common/redis/redis.module';

export const META_ADS_COMMAND_HANDLERS = [
  ConnectMetaAccountHandler,
  SyncCampaignMetricsHandler,
  ProcessMetaLeadHandler,
  MatchLeadToPatientHandler,
  HandleMetaOAuthCallbackHandler,
];

@Module({
  imports: [
    CqrsModule,
    MetaAdAccountRepositoryModule,
    MetaLeadRepositoryModule,
    MetaCampaignMetricRepositoryModule,
    MetaAdsEventModule,
    PatientQueryModule,
    RedisModule,
  ],
  providers: [
    ...META_ADS_COMMAND_HANDLERS,
    MetaMarketingApiService,
    TokenCipherService,
  ],
  exports: META_ADS_COMMAND_HANDLERS,
})
export class MetaAdsCommandModule {}
