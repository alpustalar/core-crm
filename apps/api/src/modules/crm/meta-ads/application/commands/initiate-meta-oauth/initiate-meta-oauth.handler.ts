import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InitiateMetaOAuthCommand } from './initiate-meta-oauth.command';
import { InitiateMetaOAuthResponse } from './initiate-meta-oauth.response';
import {
  IMetaMarketingApiService,
  META_MARKETING_API_SERVICE,
} from '@modules/crm/meta-ads/domain/interfaces/meta-marketing-api.interface';
import { MetaAdsCacheService } from '@modules/crm/meta-ads/infrastructure/cache/meta-ads-cache.service';
import {
  IMetaAdsConfig,
  META_ADS_CONFIG,
} from '@modules/crm/meta-ads/domain/interfaces/meta-ads-config.interface';
import { UUID } from '@src/domain/value-objects';

@CommandHandler(InitiateMetaOAuthCommand)
export class InitiateMetaOAuthHandler
  implements
    ICommandHandler<InitiateMetaOAuthCommand, InitiateMetaOAuthResponse>
{
  constructor(
    @Inject(META_MARKETING_API_SERVICE)
    private readonly metaApi: IMetaMarketingApiService,
    @Inject(META_ADS_CONFIG)
    private readonly metaAdsConfig: IMetaAdsConfig,
    private readonly cacheService: MetaAdsCacheService
  ) {}

  async execute(command: InitiateMetaOAuthCommand): Promise<string> {
    const { clinicId, ctx } = command;

    const generatedStateUUID = UUID.generate();

    await this.cacheService.metaOAuthState.set(
      generatedStateUUID.value,
      JSON.stringify({ clinicId, userId: ctx.actor.userId })
    );

    const appId = this.metaAdsConfig.appId;
    const redirectUri = this.metaAdsConfig.redirectUri;

    return this.metaApi.buildOAuthUrl(
      appId,
      redirectUri,
      generatedStateUUID.value
    );
  }
}
