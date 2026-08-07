import { Module } from '@nestjs/common';
import { MetaAdsCommandModule } from '@modules/crm/meta-ads/application/commands/command.module';
import { MetaAdsQueryModule } from '@modules/crm/meta-ads/application/queries/query.module';

const ApplicationModules = [MetaAdsCommandModule, MetaAdsQueryModule];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class MetaAdsApplicationModule {}
