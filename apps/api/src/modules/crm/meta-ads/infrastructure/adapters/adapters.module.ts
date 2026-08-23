import { Module } from '@nestjs/common';
import { MetaMarketingApiModule } from '@modules/crm/meta-ads/infrastructure/adapters/meta-marketing/meta-marketing-api.module';

@Module({
  imports: [MetaMarketingApiModule],
  exports: [MetaMarketingApiModule],
})
export class MetaAdsAdaptersModule {}
