import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { InitiateMetaOAuthCommand } from './initiate-meta-oauth.command';
import { InitiateMetaOAuthResponse } from './initiate-meta-oauth.response';
import {
  IMetaMarketingApiService,
  META_MARKETING_API_SERVICE,
} from '@modules/crm/meta-ads/domain/interfaces/meta-marketing-api.interface';
import { RedisService } from '@common/redis/redis.service';
import { ENV } from '@common/constants/env.constant';

@CommandHandler(InitiateMetaOAuthCommand)
export class InitiateMetaOAuthHandler
  implements
    ICommandHandler<InitiateMetaOAuthCommand, InitiateMetaOAuthResponse>
{
  constructor(
    @Inject(META_MARKETING_API_SERVICE)
    private readonly metaApi: IMetaMarketingApiService,
    private readonly redis: RedisService,
    private readonly config: ConfigService
  ) {}

  async execute(command: InitiateMetaOAuthCommand): Promise<string> {
    const { clinicId, ctx } = command;

    const state = randomUUID();
    await this.redis.setMetaOAuthState(
      state,
      JSON.stringify({ clinicId, userId: ctx.actor.userId })
    );

    const appId = this.config.getOrThrow<string>(ENV.META_APP_ID);
    const redirectUri = this.config.getOrThrow<string>(
      ENV.META_OAUTH_REDIRECT_URI
    );

    return this.metaApi.buildOAuthUrl(appId, redirectUri, state);
  }
}
