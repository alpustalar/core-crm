import { Injectable, Logger } from '@nestjs/common';
import {
  MessageChannelPort,
  SendMessageRequest,
  SendMessageResult,
} from '@modules/messaging/conversation/domain/ports/message-channel.port';

/**
 * Gerçek WhatsApp Cloud API / BSP adapter'ı takılana kadar devrede olan stub
 * (e-Document Noop deseni). Mesajı dışarı GÖNDERMEZ; yalnızca loglar ve sahte bir
 * externalId döner; hata FIRLATMAZ. Böylece çekirdek akış (Conversation/Message,
 * durum geçişleri) uçtan uca çalışır. Gerçek adapter eklendiğinde bu binding değişir.
 */
@Injectable()
export class StubMessageChannelAdapter implements MessageChannelPort {
  private readonly logger = new Logger(StubMessageChannelAdapter.name);

  send(request: SendMessageRequest): Promise<SendMessageResult> {
    const externalId = `stub-${crypto.randomUUID()}`;
    this.logger.log(
      `Stub kanal — mesaj GÖNDERİLMEDİ (loglandı). clinicId=${request.clinicId}, to=${request.toPhone}, type=${request.type}, externalId=${externalId}`
    );
    return Promise.resolve({ externalId });
  }
}
