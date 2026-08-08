import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { HandleMetaOAuthCallbackCommand } from '@modules/crm/meta-ads/application/commands/handle-meta-oauth-callback/handle-meta-oauth-callback.command';
import { InitiateMetaOAuthCommand } from '@modules/crm/meta-ads/application/commands/initiate-meta-oauth/initiate-meta-oauth.command';
import { ENV } from '@common/constants/env.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Controller('oauth')
export class MetaOAuthController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly config: ConfigService
  ) {}

  @UseGuards(AuthGuard)
  @Get('authorize')
  async authorize(
    @Query('clinicId') clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    if (!clinicId) throw new BadRequestException('clinicId zorunludur.');

    const url = await this.commandBus.execute(
      new InitiateMetaOAuthCommand(clinicId, ctx)
    );
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
