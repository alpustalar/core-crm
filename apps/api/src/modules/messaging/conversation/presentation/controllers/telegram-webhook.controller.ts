import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { MessageChannel, MessageType } from '@shared';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetTelegramInboundRoutingQuery } from '@modules/messaging/channel-config/application/queries/get-telegram-inbound-routing/get-telegram-inbound-routing.query';
import { RequestTelegramContactCommand } from '@modules/messaging/channel-config/application/commands/request-telegram-contact/request-telegram-contact.command';
import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { GetConversationContactStateQuery } from '@modules/messaging/conversation/application/queries/get-conversation-contact-state/get-conversation-contact-state.query';
import {
  TelegramWebhookMessage,
  TelegramWebhookUpdate,
} from '../../domain/contracts/telegram-webhook.contracts';

/**
 * Telegram Bot API webhook (public — AuthGuard yok). Tüm klinik botları aynı endpoint'in
 * farklı `:clinicId` yoluna update gönderir. Doğrulama: `x-telegram-bot-api-secret-token`
 * başlığı, setWebhook ile kurulan klinik bazlı secret ile karşılaştırılır. Geçerli text
 * mesajları ReceiveInboundMessageCommand (channel=TELEGRAM) ile çekirdeğe işlenir. Telegram
 * 200 bekler; hatalar yutulup hızlı 200 döner.
 */
@Controller('telegram')
export class TelegramWebhookController {
  private readonly logger = new Logger(TelegramWebhookController.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('bot/:clinicId')
  @HttpCode(200)
  async onUpdate(
    @Param('clinicId') clinicId: string,
    @Headers('x-telegram-bot-api-secret-token') secretToken: string,
    @Body() update: TelegramWebhookUpdate
  ): Promise<{ ok: true }> {
    const { data: routing } = await this.queryBus.execute(
      new GetTelegramInboundRoutingQuery(clinicId)
    );

    // Sahte istek koruması: kanal aktif + secret_token eşleşmeli.
    if (
      !routing ||
      !routing.isActive ||
      !routing.webhookSecret ||
      routing.webhookSecret !== secretToken
    ) {
      throw new ForbiddenException();
    }

    const message = update.message ?? update.edited_message;
    if (message) {
      await this.dispatchInbound({
        clinicId,
        organizationId: routing.organizationId,
        message,
      }).catch((err) =>
        this.logger.error('Telegram webhook işleme hatası', err)
      );
    }

    return { ok: true };
  }

  private async dispatchInbound(input: {
    clinicId: string;
    organizationId: string;
    message: TelegramWebhookMessage;
  }): Promise<void> {
    const { clinicId, organizationId, message } = input;
    const chatId = String(message.chat.id);
    const content = this.mapContent(message);
    // Kullanıcı numarasını paylaştıysa (request_contact) hasta eşlemesi için gerçek telefon.
    const matchPhone = this.extractSharedPhone(message);

    // Prompt-once: yeni/misafir bir konuşmada (henüz yokken) bir kez contact istemi gönder.
    // Contact paylaşımının kendisi geldiğinde istem göndermeyiz (zaten paylaşıyorlar).
    const isNewConversation = matchPhone
      ? false
      : !(
          await this.queryBus.execute(
            new GetConversationContactStateQuery({
              clinicId,
              channel: MessageChannel.TELEGRAM,
              contactPhone: chatId,
            })
          )
        ).data;

    await this.commandBus.execute(
      new ReceiveInboundMessageCommand({
        channel: MessageChannel.TELEGRAM,
        clinicId,
        organizationId,
        // Telegram'da kontak kimliği chatId'dir (gönderimde de toPhone=chatId kullanılır).
        contactPhone: chatId,
        // Hasta eşlemesi yalnız paylaşılan gerçek telefonla yapılır (chatId ile değil).
        matchPhone,
        contactName: this.resolveContactName(message),
        // Telegram message_id yalnızca chat içinde benzersiz → chatId ile birleştir (global @@unique).
        externalId: `tg:${chatId}:${message.message_id}`,
        type: content.type,
        body: content.body,
        occurredAt: message.date ? new Date(message.date * 1000) : undefined,
      })
    );

    if (isNewConversation) {
      await this.commandBus.execute(
        new RequestTelegramContactCommand(clinicId, chatId)
      );
    }
  }

  /**
   * Telegram mesajını kanal-bağımsız içeriğe çevirir. Text/caption ve contact (kişi kartı)
   * desteklenir; diğer tipler (medya/konum) placeholder ile UNSUPPORTED kaydedilir (gelen
   * medya proxy önizlemesi kapsam dışı).
   */
  private mapContent(message: TelegramWebhookMessage): {
    type: MessageType;
    body: string | null;
  } {
    const text = message.text ?? message.caption;
    if (text) {
      return { type: MessageType.TEXT, body: text };
    }
    if (message.contact?.phone_number) {
      return {
        type: MessageType.CONTACTS,
        body: `📱 ${message.contact.phone_number}`,
      };
    }
    return { type: MessageType.UNSUPPORTED, body: '[desteklenmeyen mesaj]' };
  }

  /**
   * Paylaşılan kişinin telefonunu hasta eşlemesine uygun biçime getirir (rakam-only,
   * WhatsApp `from` ile aynı konvansiyon). Kişi paylaşılmadıysa null.
   */
  private extractSharedPhone(message: TelegramWebhookMessage): string | null {
    const phone = message.contact?.phone_number;
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    return digits.length > 0 ? digits : null;
  }

  /** from.first_name (+ last_name) ya da username'den okunabilir kontak adı üretir. */
  private resolveContactName(message: TelegramWebhookMessage): string | null {
    const from = message.from;
    if (!from) return null;
    const fullName = [from.first_name, from.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
    return fullName || from.username || null;
  }
}
