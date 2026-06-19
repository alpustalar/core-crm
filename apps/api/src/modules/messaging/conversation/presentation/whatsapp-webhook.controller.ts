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
import * as crypto from 'crypto';
import { MessageStatus, MessageType } from '@prisma/client';
import { ENV } from '@common/constants/env.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindWhatsappChannelByPhoneNumberIdQuery } from '@modules/messaging/channel-config/application/queries/find-whatsapp-channel-by-phone-number-id/find-whatsapp-channel-by-phone-number-id.query';
import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { MarkMessageStatusCommand } from '@modules/messaging/conversation/application/commands/mark-message-status/mark-message-status.command';
import {
  WhatsappWebhookBody,
  WhatsappValue,
  WhatsappInboundMessage,
  WhatsappStatus,
} from './whatsapp-webhook.types';

/** Meta WhatsApp status string → domain MessageStatus. */
const STATUS_MAP: Record<string, MessageStatus> = {
  sent: MessageStatus.SENT,
  delivered: MessageStatus.DELIVERED,
  read: MessageStatus.READ,
  failed: MessageStatus.FAILED,
};

/**
 * WhatsApp Cloud API webhook (public — AuthGuard yok). GET: Meta doğrulama challenge.
 * POST: x-hub-signature-256 imza kontrolü (rawBody) → her value.metadata.phone_number_id
 * için klinik routing → inbound mesajlar ReceiveInboundMessageCommand, status'lar
 * MarkMessageStatusCommand. Hatalar yutulur (Meta'ya hızlı 200).
 */
@Controller('whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger(WhatsappWebhookController.name);

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
  ): number {
    const expectedToken = this.configService.getOrThrow<string>(
      ENV.WHATSAPP_WEBHOOK_VERIFY_TOKEN
    );
    if (mode === 'subscribe' && verifyToken === expectedToken) {
      return parseInt(challenge, 10);
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
      ENV.WHATSAPP_APP_SECRET
    );
    if (!this.verifySignature(req.rawBody, signature ?? '', appSecret)) {
      throw new ForbiddenException('Geçersiz webhook imzası.');
    }

    const body = req.body as WhatsappWebhookBody;
    if (body?.object !== 'whatsapp_business_account') {
      return { status: 'ignored' };
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'messages') continue;
        await this.processValue(change.value).catch((err) =>
          this.logger.error('WhatsApp webhook işleme hatası', err)
        );
      }
    }

    return { status: 'ok' };
  }

  /** Bir value bloğunu klinik routing yapıp inbound mesaj/status'lara dağıtır. */
  private async processValue(value: WhatsappValue): Promise<void> {
    const phoneNumberId = value?.metadata?.phone_number_id;
    if (!phoneNumberId) return;

    const { data: channel } = await this.queryBus.execute(
      new FindWhatsappChannelByPhoneNumberIdQuery(phoneNumberId)
    );
    if (!channel || !channel.isActive) {
      this.logger.warn(`Bilinmeyen/pasif phone_number_id: ${phoneNumberId}`);
      return;
    }

    const contactName = value.contacts?.[0]?.profile?.name ?? null;

    for (const message of value.messages ?? []) {
      await this.dispatchInbound({
        message,
        clinicId: channel.clinicId,
        organizationId: channel.organizationId,
        contactName,
      });
    }

    for (const status of value.statuses ?? []) {
      await this.dispatchStatus(status);
    }
  }

  private async dispatchInbound(input: {
    message: WhatsappInboundMessage;
    clinicId: string;
    organizationId: string;
    contactName: string | null;
  }): Promise<void> {
    const { message, clinicId, organizationId, contactName } = input;
    const isText = message.type === 'text';
    await this.commandBus.execute(
      new ReceiveInboundMessageCommand({
        clinicId,
        organizationId,
        contactPhone: message.from,
        contactName,
        externalId: message.id,
        type: isText ? MessageType.TEXT : MessageType.MEDIA,
        body: isText ? (message.text?.body ?? null) : null,
        occurredAt: message.timestamp
          ? new Date(Number(message.timestamp) * 1000)
          : undefined,
      })
    );
  }

  private async dispatchStatus(status: WhatsappStatus): Promise<void> {
    const mapped = STATUS_MAP[status.status];
    if (!mapped) return;
    await this.commandBus.execute(
      new MarkMessageStatusCommand(
        status.id,
        mapped,
        status.errors?.[0]?.title ?? null
      )
    );
  }

  private verifySignature(
    rawBody: Buffer,
    signature: string,
    appSecret: string
  ): boolean {
    try {
      const expected = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex')}`;
      const a = Buffer.from(expected);
      const b = Buffer.from(signature);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
}
