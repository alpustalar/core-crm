import { Module } from '@nestjs/common';
import { AI_TOOL_EXECUTOR } from '@common/ai-tools';
import { NatsClientModule } from '@src/transport';
import { AI_CHAT_PORT } from '@modules/ai-agent/domain/ports/ai-chat.port';
import { AnthropicChatAdapter } from './anthropic/anthropic-chat.adapter';
import { GeminiChatAdapter } from './gemini/gemini-chat.adapter';
import { AiChatRouterAdapter } from './ai-chat-router.adapter';
import { NatsAiToolExecutor } from './nats-ai-tool-executor.adapter';

/**
 * AI sohbet portu bağlaması: AI_CHAT_PORT → AiChatRouterAdapter (klinik config'inin
 * provider'ına göre Claude/Gemini adapter'ına yönlendirir). Her adapter anahtar yoksa
 * kendi platform fallback'ini (ANTHROPIC_API_KEY / GEMINI_API_KEY) kullanır; o da yoksa
 * boş yanıt döner. Test/fallback için NoopAiChatAdapter mevcuttur.
 *
 * Araç çalıştırma `AI_TOOL_EXECUTOR` token'ıyla gelir. Araçlar core'da yaşamaya devam
 * eder (randevu, otel, transfer… core'un aggregate'leri); messaging onları NATS üzerinden
 * çağırır. Sohbet adapter'ları token'ı gördüğü için bu geçişte değişmedi.
 */
@Module({
  imports: [NatsClientModule],
  providers: [
    AnthropicChatAdapter,
    GeminiChatAdapter,
    { provide: AI_TOOL_EXECUTOR, useClass: NatsAiToolExecutor },
    { provide: AI_CHAT_PORT, useClass: AiChatRouterAdapter },
  ],
  exports: [AI_CHAT_PORT],
})
export class AiChatModule {}
