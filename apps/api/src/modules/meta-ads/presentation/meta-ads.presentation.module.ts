import { Module } from '@nestjs/common';
import { MetaAdsController } from './controllers/meta-ads.controller';
import { MetaWebhookController } from './controllers/meta-webhook.controller';
import { MetaOAuthController } from './controllers/meta-oauth.controller';
import { MetaAdsCommandModule } from '@modules/meta-ads/application/commands/command.module';
import { MetaAdsQueryModule } from '@modules/meta-ads/application/queries/query.module';
import { MetaAdAccountRepositoryModule } from '@modules/meta-ads/infrastructure/persistence/prisma/repositories/meta-ad-account/meta-ad-account.repository.module';
import { MetaMarketingApiService } from '@modules/meta-ads/infrastructure/http/meta-marketing-api.service';
import { RedisModule } from '@common/redis/redis.module';

@Module({
  imports: [
    MetaAdsCommandModule,
    MetaAdsQueryModule,
    MetaAdAccountRepositoryModule,
    RedisModule,
  ],
  controllers: [MetaAdsController, MetaWebhookController, MetaOAuthController],
  providers: [MetaMarketingApiService],
})
export class MetaAdsPresentationModule {}
