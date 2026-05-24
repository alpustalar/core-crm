import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Inject,
  Logger,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import { MetaMarketingApiService } from '@modules/meta-ads/infrastructure/http/meta-marketing-api.service';
import { ProcessMetaLeadCommand } from '@modules/meta-ads/application/commands/process-meta-lead/process-meta-lead.command';
import {
  IMetaAdAccountQueryRepository,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

interface MetaWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      leadgen_id: string;
      page_id: string;
      form_id: string;
      ad_id: string;
      adset_id: string;
      campaign_id: string;
      created_time: number;
    };
    field: string;
  }>;
}

@Controller('meta-ads/webhook')
export class MetaWebhookController {
  private readonly logger = new Logger(MetaWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly commandBus: TSCommandBus,
    private readonly metaApi: MetaMarketingApiService,
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IMetaAdAccountQueryRepository
  ) {}

  // Meta webhook doğrulama (GET)
  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string
  ) {
    const expectedToken = this.configService.getOrThrow<string>(
      ENV.META_WEBHOOK_VERIFY_TOKEN
    );

    if (mode === 'subscribe' && verifyToken === expectedToken) {
      return parseInt(challenge, 10);
    }

    throw new ForbiddenException('Webhook doğrulama başarısız.');
  }

  // Lead webhook (POST)
  @Post()
  async receive(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: { object: string; entry: MetaWebhookEntry[] }
  ) {
    if (!req.rawBody) throw new BadRequestException();

    const appSecret = this.configService.getOrThrow<string>(
      ENV.META_APP_SECRET
    );
    const isValid = this.metaApi.verifyWebhookSignature(
      req.rawBody,
      signature ?? '',
      appSecret
    );

    if (!isValid) throw new ForbiddenException('Geçersiz webhook imzası.');

    if (body.object !== 'page') return { status: 'ignored' };

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'leadgen') continue;
        await this.processLeadChange(change.value).catch((err) =>
          this.logger.error('Lead işleme hatası', err)
        );
      }
    }

    return { status: 'ok' };
  }

  private async processLeadChange(
    value: MetaWebhookEntry['changes'][0]['value']
  ) {
    const accounts = await this.accountQueryRepo.findAllActive();
    const matchingAccount = accounts.find((a) => a.pageId === value.page_id);

    if (!matchingAccount) {
      this.logger.warn(`Bilinmeyen page_id: ${value.page_id}`);
      return;
    }

    await this.commandBus.execute(
      new ProcessMetaLeadCommand({
        metaLeadId: value.leadgen_id,
        metaAdAccountId: matchingAccount.id,
        formId: value.form_id,
        campaignId: value.campaign_id,
        adsetId: value.adset_id,
        adId: value.ad_id,
      })
    );
  }
}
