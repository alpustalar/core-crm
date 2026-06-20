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
import { RecordWhatsappQualityCommand } from '@modules/messaging/channel-config/application/commands/record-whatsapp-quality/record-whatsapp-quality.command';
import { toWhatsappMediaRef } from '@modules/messaging/conversation/domain/media-reference';
import { resolveWhatsappError } from '@modules/messaging/conversation/domain/whatsapp-error.map';
import { InboundMessagePayload } from '@modules/messaging/conversation/domain/types/create-message.props';
import {
  WhatsappWebhookBody,
  WhatsappValue,
  WhatsappInboundMessage,
  WhatsappMediaObject,
  WhatsappStatus,
  WhatsappQualityValue,
} from './whatsapp-webhook.types';

/** Webhook'tan çıkarılan kanal-bağımsız mesaj içeriği. */
interface MappedInboundContent {
  type: MessageType;
  body: string | null;
  mediaUrl: string | null;
  payload: InboundMessagePayload | null;
}

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
        if (change.field === 'messages') {
          await this.processValue(change.value).catch((err) =>
            this.logger.error('WhatsApp webhook işleme hatası', err)
          );
        } else if (change.field === 'phone_number_quality_update') {
          await this.processQualityUpdate(
            change.value as unknown as WhatsappQualityValue
          ).catch((err) =>
            this.logger.error('WhatsApp kalite webhook hatası', err)
          );
        }
      }
    }

    return { status: 'ok' };
  }

  /** Numara kalitesi/tier güncellemesini kanala işler (display_phone_number ile routing). */
  private async processQualityUpdate(
    value: WhatsappQualityValue
  ): Promise<void> {
    const display = value?.display_phone_number;
    if (!display) return;
    const qualityRating =
      value.event === 'FLAGGED'
        ? 'RED'
        : value.event === 'UNFLAGGED'
          ? 'GREEN'
          : null;
    await this.commandBus.execute(
      new RecordWhatsappQualityCommand(
        display,
        qualityRating,
        value.current_limit ?? null
      )
    );
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
    const content = this.mapContent(message);

    await this.commandBus.execute(
      new ReceiveInboundMessageCommand({
        clinicId,
        organizationId,
        contactPhone: message.from,
        contactName,
        externalId: message.id,
        type: content.type,
        body: content.body,
        mediaUrl: content.mediaUrl,
        payload: content.payload,
        replyToExternalId: message.context?.id ?? null,
        occurredAt: message.timestamp
          ? new Date(Number(message.timestamp) * 1000)
          : undefined,
      })
    );
  }

  /** WhatsApp gelen mesaj tipini kanal-bağımsız içeriğe (type+body+media+payload) çevirir. */
  private mapContent(message: WhatsappInboundMessage): MappedInboundContent {
    switch (message.type) {
      case 'text':
        return {
          type: MessageType.TEXT,
          body: message.text?.body ?? null,
          mediaUrl: null,
          payload: null,
        };
      case 'image':
      case 'document':
      case 'video':
      case 'audio':
      case 'sticker': {
        const media = this.extractMedia(message);
        return {
          type: MessageType.MEDIA,
          body: media?.caption ?? null,
          // Medya saklanmaz; Meta media id referansı tutulur (önizlemede proxy ile çekilir).
          mediaUrl: media ? toWhatsappMediaRef(media.id) : null,
          payload: null,
        };
      }
      case 'interactive': {
        const reply =
          message.interactive?.button_reply ??
          message.interactive?.list_reply;
        const interactiveType = message.interactive?.button_reply
          ? 'button_reply'
          : 'list_reply';
        return {
          type: MessageType.INTERACTIVE,
          body: reply?.title ?? null,
          mediaUrl: null,
          payload: reply
            ? {
                kind: 'interactive',
                interactiveType,
                replyId: reply.id,
                title: reply.title ?? null,
              }
            : null,
        };
      }
      case 'location': {
        const loc = message.location;
        if (!loc) {
          return {
            type: MessageType.LOCATION,
            body: '📍 Konum',
            mediaUrl: null,
            payload: null,
          };
        }
        return {
          type: MessageType.LOCATION,
          body: loc.name ?? loc.address ?? '📍 Konum',
          mediaUrl: null,
          payload: {
            kind: 'location',
            latitude: loc.latitude,
            longitude: loc.longitude,
            name: loc.name ?? null,
            address: loc.address ?? null,
          },
        };
      }
      case 'reaction':
        return {
          type: MessageType.REACTION,
          body: message.reaction?.emoji ?? null,
          mediaUrl: null,
          payload: message.reaction
            ? {
                kind: 'reaction',
                emoji: message.reaction.emoji ?? null,
                targetExternalId: message.reaction.message_id,
              }
            : null,
        };
      case 'contacts':
        return {
          type: MessageType.CONTACTS,
          body: '👤 Kişi kartı',
          mediaUrl: null,
          payload: { kind: 'contacts', contacts: message.contacts ?? [] },
        };
      default:
        // Konum talebi, sipariş, sistem mesajı vb. — gövdesiz UNSUPPORTED kaydı.
        return {
          type: MessageType.UNSUPPORTED,
          body: null,
          mediaUrl: null,
          payload: null,
        };
    }
  }

  /** Medya mesajı gövdesini (id + caption) çıkarır. */
  private extractMedia(
    message: WhatsappInboundMessage
  ): WhatsappMediaObject | undefined {
    return (
      message.image ??
      message.document ??
      message.video ??
      message.audio ??
      message.sticker
    );
  }

  private async dispatchStatus(status: WhatsappStatus): Promise<void> {
    const mapped = STATUS_MAP[status.status];
    if (!mapped) return;

    // FAILED ise hata kodunu okunabilir nedene çevir; aksi halde reason/kod yok.
    const error = status.errors?.[0];
    const resolved =
      mapped === MessageStatus.FAILED && error
        ? resolveWhatsappError(error.code, error.title)
        : null;

    const expiry = status.conversation?.expiration_timestamp;
    await this.commandBus.execute(
      new MarkMessageStatusCommand(
        status.id,
        mapped,
        resolved?.reason ?? null,
        error?.code != null ? String(error.code) : null,
        {
          category: status.pricing?.category ?? null,
          billable: status.pricing?.billable ?? null,
          windowExpiresAt: expiry ? new Date(Number(expiry) * 1000) : null,
        }
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
