import { Module } from '@nestjs/common';
import { AI_CHAT_PORT } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import { AI_TOOL_EXECUTOR } from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import { AnthropicChatAdapter } from './anthropic/anthropic-chat.adapter';
import { AiToolExecutor } from '../ai-tools/ai-tool-executor.service';

/**
 * AI sohbet portu bağlaması: AI_CHAT_PORT → AnthropicChatAdapter, AI_TOOL_EXECUTOR →
 * AiToolExecutor (araçlar global CommandBus/QueryBus üzerinden dağıtılır). Anahtar yoksa
 * adapter platform fallback'i (ENV.ANTHROPIC_API_KEY) kullanır; o da yoksa boş yanıt döner.
 * Test/fallback için NoopAiChatAdapter ayrıca mevcuttur.
 */
@Module({
  providers: [
    { provide: AI_TOOL_EXECUTOR, useClass: AiToolExecutor },
    { provide: AI_CHAT_PORT, useClass: AnthropicChatAdapter },
  ],
  exports: [AI_CHAT_PORT],
})
export class AiChatModule {}
