import { Module } from '@nestjs/common';
import { MetaAdsPresentationModule } from './presentation/presentation.module';
import { MetaAdsInfrastructureModule } from '@modules/crm/meta-ads/infrastructure/infrastructure.module';
import { MetaAdsApplicationModule } from '@modules/crm/meta-ads/application/application.module';

@Module({
  imports: [
    MetaAdsPresentationModule,
    MetaAdsInfrastructureModule,
    MetaAdsApplicationModule,
  ],
})
export class MetaAdsModule {}
