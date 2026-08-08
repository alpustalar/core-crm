import { Module } from '@nestjs/common';
import { AI_CHAT_PORT } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import { AiToolsModule } from '@modules/platform/ai-tools/ai-tools.module';
import { AnthropicChatAdapter } from './anthropic/anthropic-chat.adapter';
import { GeminiChatAdapter } from './gemini/gemini-chat.adapter';
import { AiChatRouterAdapter } from './ai-chat-router.adapter';

/**
 * AI sohbet portu bağlaması: AI_CHAT_PORT → AiChatRouterAdapter (klinik config'inin
 * provider'ına göre Claude/Gemini adapter'ına yönlendirir). Her adapter anahtar yoksa
 * kendi platform fallback'ini (ANTHROPIC_API_KEY / GEMINI_API_KEY) kullanır; o da yoksa
 * boş yanıt döner. Test/fallback için NoopAiChatAdapter mevcuttur.
 *
 * Araç çalıştırma `AI_TOOL_EXECUTOR` token'ıyla gelir ve **core tarafından** sağlanır
 * (`AiToolsModule`, platform/ai-tools). Bu modül executor'ın somut sınıfını görmez —
 * Faz 3'te token bir NATS istemcisine bağlandığında burada değişiklik gerekmez.
 */
@Module({
  imports: [AiToolsModule],
  providers: [
    AnthropicChatAdapter,
    GeminiChatAdapter,
    { provide: AI_CHAT_PORT, useClass: AiChatRouterAdapter },
  ],
  exports: [AI_CHAT_PORT],
})
export class AiChatModule {}
