import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AuthGuard } from '@modules/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { RedisService } from '@common/redis/redis.service';
import { MetaMarketingApiService } from '@modules/meta-ads/infrastructure/http/meta-marketing-api.service';
import { HandleMetaOAuthCallbackCommand } from '@modules/meta-ads/application/commands/handle-meta-oauth-callback/handle-meta-oauth-callback.command';
import { ENV } from '@common/constants/env.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Controller('meta-ads/oauth')
export class MetaOAuthController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly redis: RedisService,
    private readonly metaApi: MetaMarketingApiService,
    private readonly config: ConfigService
  ) {}

  @UseGuards(AuthGuard)
  @Get('authorize')
  async authorize(
    @Query('clinicId') clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    if (!clinicId) throw new BadRequestException('clinicId zorunludur.');

    const state = randomUUID();
    await this.redis.setMetaOAuthState(
      state,
      JSON.stringify({ clinicId, userId: ctx.actor.userId })
    );

    const appId = this.config.getOrThrow<string>(ENV.META_APP_ID);
    const redirectUri = this.config.getOrThrow<string>(
      ENV.META_OAUTH_REDIRECT_URI
    );
    const url = this.metaApi.buildOAuthUrl(appId, redirectUri, state);

    return { url };
  }

  @Get('callback')
  @Redirect()
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string
  ) {
    if (error) throw new BadRequestException(`Meta OAuth reddedildi: ${error}`);
    if (!code || !state)
      throw new BadRequestException('code ve state zorunludur.');

    await this.commandBus.execute(
      new HandleMetaOAuthCallbackCommand(code, state)
    );

    const webBaseUrl =
      this.config.get<string>(ENV.ORIGIN) ?? 'http://localhost:3000';
    return { url: `${webBaseUrl}/meta-ads/connected`, statusCode: 302 };
  }
}
