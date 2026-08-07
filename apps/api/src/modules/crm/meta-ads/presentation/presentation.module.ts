import { Module } from '@nestjs/common';
import { MetaAdsController } from './controllers/meta-ads.controller';
import { MetaWebhookController } from './controllers/meta-webhook.controller';
import { MetaOAuthController } from './controllers/meta-oauth.controller';
import { MetaAdsApplicationModule } from '@modules/crm/meta-ads/application/application.module';
import { MetaAdsInfrastructureModule } from '@modules/crm/meta-ads/infrastructure/infrastructure.module';
import {
  IMetaAdsPresentationConfig,
  META_ADS_PRESENTATION_CONFIG,
} from '@modules/crm/meta-ads/domain/interfaces/meta-ads-config.interface';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants';

@Module({
  imports: [MetaAdsApplicationModule, MetaAdsInfrastructureModule],
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
