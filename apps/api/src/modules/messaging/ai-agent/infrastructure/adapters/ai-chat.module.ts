import { Module } from '@nestjs/common';
import { AI_CHAT_PORT } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import { AI_TOOL_EXECUTOR } from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import { AnthropicChatAdapter } from './anthropic/anthropic-chat.adapter';
import { GeminiChatAdapter } from './gemini/gemini-chat.adapter';
import { AiChatRouterAdapter } from './ai-chat-router.adapter';
import { AiToolExecutor } from '../ai-tools/ai-tool-executor.service';
import { RedisModule } from '@src/infrastructure/cache/redis/redis.module';

/**
 * AI sohbet portu bağlaması: AI_CHAT_PORT → AiChatRouterAdapter (klinik config'inin
 * provider'ına göre Claude/Gemini adapter'ına yönlendirir), AI_TOOL_EXECUTOR →
 * AiToolExecutor (araçlar global CommandBus/QueryBus üzerinden dağıtılır; otel rateKey
 * token haritası için RedisService). Her adapter anahtar yoksa kendi platform fallback'ini
 * (ANTHROPIC_API_KEY / GEMINI_API_KEY) kullanır; o da yoksa boş yanıt döner. Test/fallback
 * için NoopAiChatAdapter ayrıca mevcuttur.
 */
@Module({
  imports: [RedisModule],
  providers: [
    AnthropicChatAdapter,
    GeminiChatAdapter,
    { provide: AI_TOOL_EXECUTOR, useClass: AiToolExecutor },
    { provide: AI_CHAT_PORT, useClass: AiChatRouterAdapter },
  ],
  exports: [AI_CHAT_PORT],
})
export class AiChatModule {}
