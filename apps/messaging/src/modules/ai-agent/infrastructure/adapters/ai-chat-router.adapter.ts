import { Injectable } from '@nestjs/common';
import {
  AiReplyRequest,
  AiReplyResult,
  IAiChatPort,
} from '@modules/ai-agent/domain/ports/ai-chat.port';
import { AnthropicChatAdapter } from './anthropic/anthropic-chat.adapter';
import { GeminiChatAdapter } from './gemini/gemini-chat.adapter';

/**
 * AI_CHAT_PORT'a bağlanan yönlendirici. request.provider'a göre ilgili sağlayıcı
 * adapter'ına devreder (ANTHROPIC → Claude, GEMINI → Gemini; bilinmeyen → Anthropic).
 * Klinik config'i hangi sağlayıcıyı seçtiyse o kullanılır (channel-router deseni).
 */
@Injectable()
export class AiChatRouterAdapter implements IAiChatPort {
  constructor(
    private readonly anthropic: AnthropicChatAdapter,
    private readonly gemini: GeminiChatAdapter
  ) {}

  generateReply(request: AiReplyRequest): Promise<AiReplyResult> {
    return this.resolve(request.provider).generateReply(request);
  }

  private resolve(provider: AiReplyRequest['provider']): IAiChatPort {
    switch (provider) {
      case 'GEMINI':
        return this.gemini;
      case 'ANTHROPIC':
      default:
        return this.anthropic;
    }
  }
}
