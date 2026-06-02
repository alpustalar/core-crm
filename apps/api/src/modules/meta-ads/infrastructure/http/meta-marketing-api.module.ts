import { Module } from '@nestjs/common';
import { MetaMarketingApiService } from './meta-marketing-api.service';
import { META_MARKETING_API_SERVICE } from '@modules/meta-ads/domain/interfaces/meta-marketing-api.interface';

@Module({
  providers: [
    { provide: META_MARKETING_API_SERVICE, useClass: MetaMarketingApiService },
  ],
  exports: [META_MARKETING_API_SERVICE],
})
export class MetaMarketingApiModule {}
