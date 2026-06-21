import { Injectable, Logger } from '@nestjs/common';
import {
  AiReplyRequest,
  AiReplyResult,
  IAiChatPort,
} from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';

/**
 * AI sohbet portunun no-op implementasyonu (test/fallback). Hiçbir dış çağrı yapmaz;
 * her zaman boş yanıt döner. Anthropic anahtarı/SDK olmadan akışın güvenle çalışmasını
 * sağlar (e-Document Noop adapter deseni).
 */
@Injectable()
export class NoopAiChatAdapter implements IAiChatPort {
  private readonly logger = new Logger(NoopAiChatAdapter.name);

  async generateReply(request: AiReplyRequest): Promise<AiReplyResult> {
    this.logger.debug(
      `NoopAiChatAdapter: yanıt üretilmedi (clinicId=${request.clinicId}).`
    );
    return { text: null, handoff: false, toolsUsed: [] };
  }
}
