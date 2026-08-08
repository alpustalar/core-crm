import { Module } from '@nestjs/common';
import { ConnectMetaAccountHandler } from './connect-meta-account/connect-meta-account.handler';
import { SyncCampaignMetricsHandler } from './sync-campaign-metrics/sync-campaign-metrics.handler';
import { ProcessMetaLeadHandler } from './process-meta-lead/process-meta-lead.handler';
import { MatchLeadToPatientHandler } from './match-lead-to-patient/match-lead-to-patient.handler';
import { HandleMetaOAuthCallbackHandler } from './handle-meta-oauth-callback/handle-meta-oauth-callback.handler';
import { RefreshMetaTokensHandler } from './refresh-meta-tokens/refresh-meta-tokens.handler';
import { InitiateMetaOAuthHandler } from './initiate-meta-oauth/initiate-meta-oauth.handler';
import { MetaAdsCacheService } from '@modules/crm/meta-ads/infrastructure/cache/meta-ads-cache.service';
import {
  IMetaAdsConfig,
  META_ADS_CONFIG,
} from '@modules/crm/meta-ads/domain/interfaces/meta-ads-config.interface';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants';
import { MetaAdsInfrastructureModule } from '@modules/crm/meta-ads/infrastructure/infrastructure.module';

export const META_ADS_COMMAND_HANDLERS = [
  ConnectMetaAccountHandler,
  SyncCampaignMetricsHandler,
  ProcessMetaLeadHandler,
  MatchLeadToPatientHandler,
  HandleMetaOAuthCallbackHandler,
  RefreshMetaTokensHandler,
  InitiateMetaOAuthHandler,
];

@Module({
  imports: [MetaAdsInfrastructureModule],
  providers: [
    ...META_ADS_COMMAND_HANDLERS,
    MetaAdsCacheService,
    {
      provide: META_ADS_CONFIG,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): IMetaAdsConfig => ({
        appId: configService.getOrThrow(ENV.META_APP_ID),
        appSecret: configService.getOrThrow(ENV.META_APP_SECRET),
        redirectUri: configService.getOrThrow(ENV.META_OAUTH_REDIRECT_URI),
      }),
    },
  ],
  exports: META_ADS_COMMAND_HANDLERS,
})
export class MetaAdsCommandModule {}
