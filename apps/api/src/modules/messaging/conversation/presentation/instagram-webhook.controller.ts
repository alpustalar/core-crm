import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Logger,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { MessageChannel, MessageType } from '@prisma/client';
import { ENV } from '@common/constants/env.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindInstagramChannelByIgUserIdQuery } from '@modules/messaging/channel-config/application/queries/find-instagram-channel-by-ig-user-id/find-instagram-channel-by-ig-user-id.query';
import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { InboundReferral } from '@modules/messaging/conversation/domain/types/inbound-referral';
import {
  InstagramWebhookBody,
  InstagramWebhookMessaging,
  InstagramWebhookReferral,
} from './instagram-webhook.types';
import { CryptoManager } from '@src/infrastructure/security/crypto/crypto.manager';

/**
 * Instagram (Messenger Platform) webhook (public — AuthGuard yok). GET: Meta doğrulama
 * challenge. POST: x-hub-signature-256 imza kontrolü (rawBody) → her entry.id (IG hesap id)
 * için klinik routing → gelen mesajlar ReceiveInboundMessageCommand (channel=INSTAGRAM).
 * İşletmenin kendi echo mesajları (is_echo) atlanır. Hatalar yutulur (Meta'ya hızlı 200).
 */
@Controller('instagram')
export class InstagramWebhookController {
  private readonly logger = new Logger(InstagramWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Get('webhook')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string
  ): string {
    const expectedToken = this.configService.getOrThrow<string>(
      ENV.INSTAGRAM_WEBHOOK_VERIFY_TOKEN
    );
    if (mode === 'subscribe' && verifyToken === expectedToken) {
      return challenge;
    }
    throw new ForbiddenException('Webhook doğrulama başarısız.');
  }

  @Post('webhook')
  async receive(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string
  ): Promise<{ status: string }> {
    if (!req.rawBody) throw new BadRequestException();

    const appSecret = this.configService.getOrThrow<string>(
      ENV.INSTAGRAM_APP_SECRET
    );
    if (!this.verifySignature(req.rawBody, signature ?? '', appSecret)) {
      throw new ForbiddenException('Geçersiz webhook imzası.');
    }

    const body = req.body as InstagramWebhookBody;
    if (body?.object !== 'instagram') {
      return { status: 'ignored' };
    }

    for (const entry of body.entry ?? []) {
      const igUserId = entry.id;
      if (!igUserId) continue;
      for (const messaging of entry.messaging ?? []) {
        await this.processMessaging(igUserId, messaging).catch((err) =>
          this.logger.error('Instagram webhook işleme hatası', err)
        );
      }
    }

    return { status: 'ok' };
  }

  private verifySignature(
    rawBody: Buffer,
    signature: string,
    appSecret: string
  ): boolean {
    return CryptoManager.verifyWebhookSignature(rawBody, signature, appSecret);
  }

  /** Bir messaging olayını klinik routing yapıp gelen mesaja dağıtır. */
  private async processMessaging(
    igUserId: string,
    messaging: InstagramWebhookMessaging
  ): Promise<void> {
    const message = messaging.message;
    // Yalnız gerçek gelen mesaj (echo/teslim/okundu değil).
    if (!message?.mid || message.is_echo) return;

    const senderId = messaging.sender?.id;
    if (!senderId) return;

    const { data: routing } = await this.queryBus.execute(
      new FindInstagramChannelByIgUserIdQuery(igUserId)
    );
    if (!routing || !routing.isActive) {
      this.logger.warn(`Bilinmeyen/pasif Instagram hesabı: ${igUserId}`);
      return;
    }

    const content = this.mapContent(messaging);

    await this.commandBus.execute(
      new ReceiveInboundMessageCommand({
        channel: MessageChannel.INSTAGRAM,
        clinicId: routing.clinicId,
        organizationId: routing.organizationId,
        // Instagram'da kontak kimliği IGSID'dir (gönderimde de toPhone=IGSID kullanılır).
        contactPhone: senderId,
        // Webhook telefon/isim taşımaz; IG'de hasta telefonla eşlenemez → misafir.
        externalId: message.mid,
        type: content.type,
        body: content.body,
        referral: this.mapReferral(messaging.referral ?? message.referral),
        occurredAt: messaging.timestamp
          ? new Date(messaging.timestamp)
          : undefined,
      })
    );
  }

  /** Instagram reklam referral'ını kanal-bağımsız InboundReferral'a çevirir. */
  private mapReferral(
    referral: InstagramWebhookReferral | undefined
  ): InboundReferral | undefined {
    if (!referral) return undefined;
    return {
      medium: referral.source === 'ADS' || referral.ad_id ? 'AD' : 'ORGANIC',
      adId: referral.ad_id ?? null,
      sourceUrl: null,
      ctwaClid: null,
      headline: null,
      body: null,
    };
  }

  /**
   * Instagram mesajını kanal-bağımsız içeriğe çevirir. Text tam desteklenir; medya/story
   * gibi ekli tipler placeholder ile UNSUPPORTED kaydedilir (gelen medya proxy kapsam dışı).
   */
  private mapContent(messaging: InstagramWebhookMessaging): {
    type: MessageType;
    body: string | null;
  } {
    const text = messaging.message?.text;
    if (text) {
      return { type: MessageType.TEXT, body: text };
    }
    return { type: MessageType.UNSUPPORTED, body: '[desteklenmeyen mesaj]' };
  }
}
