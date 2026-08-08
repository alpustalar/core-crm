import { Module } from '@nestjs/common';
import { MetaAdsController } from '@modules/crm/meta-ads/presentation/http/controllers/meta-ads.controller';
import { MetaWebhookController } from '@modules/crm/meta-ads/presentation/http/controllers/meta-webhook.controller';
import { MetaOAuthController } from '@modules/crm/meta-ads/presentation/http/controllers/meta-oauth.controller';
import { MetaAdsInfrastructureModule } from '@modules/crm/meta-ads/infrastructure/infrastructure.module';
import {
  IMetaAdsPresentationConfig,
  META_ADS_PRESENTATION_CONFIG,
} from '@modules/crm/meta-ads/domain/interfaces/meta-ads-config.interface';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants';

@Module({
  imports: [MetaAdsInfrastructureModule],
  controllers: [MetaAdsController, MetaWebhookController, MetaOAuthController],
  providers: [
    {
      provide: META_ADS_PRESENTATION_CONFIG,
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService
      ): IMetaAdsPresentationConfig => ({
        appSecret: configService.getOrThrow(ENV.META_APP_SECRET),
        verifyToken: configService.getOrThrow(ENV.META_APP_SECRET),
      }),
    },
  ],
})
export class MetaAdsPresentationModule {}
