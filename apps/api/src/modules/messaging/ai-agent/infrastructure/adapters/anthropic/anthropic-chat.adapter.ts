import Anthropic from '@anthropic-ai/sdk';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import {
  AiReplyRequest,
  AiReplyResult,
  IAiChatPort,
} from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import {
  AI_TOOL_EXECUTOR,
  AiToolContext,
  IAiToolExecutor,
} from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import {
  buildSystemPrompt,
  DEFAULT_MAX_TOKENS,
  MAX_TOOL_ITERATIONS,
} from '../ai-chat.constants';

/**
 * Anthropic Claude tabanlı AI sohbet adapter'ı. Klinik config'inden (yoksa platform
 * fallback ENV.ANTHROPIC_API_KEY) anahtarı çözer, manuel tool-use döngüsü ile araçları
 * (AiToolExecutor → CommandBus/QueryBus) çalıştırır ve nihai metni döner. Streaming yok;
 * sistem prompt'u prompt-caching ile işaretlenir. Haiku adaptive thinking desteklemediği
 * için thinking parametresi gönderilmez.
 */
@Injectable()
export class AnthropicChatAdapter implements IAiChatPort {
  private readonly logger = new Logger(AnthropicChatAdapter.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(AI_TOOL_EXECUTOR)
    private readonly toolExecutor: IAiToolExecutor
  ) {}

  async generateReply(request: AiReplyRequest): Promise<AiReplyResult> {
    const apiKey =
      request.apiKey ?? this.config.get<string>(ENV.ANTHROPIC_API_KEY);
    if (!apiKey) {
      this.logger.warn(
        `Anthropic anahtarı yok (clinicId=${request.clinicId}); AI yanıtı üretilemedi.`
      );
      return { text: null, handoff: false, toolsUsed: [] };
    }

    const client = new Anthropic({ apiKey });
    const toolContext: AiToolContext = {
      clinicId: request.clinicId,
      organizationId: request.organizationId,
      conversationId: request.conversationId,
      channel: request.channel,
      contactName: request.contactName,
      contactPhone: request.contactPhone,
      patientId: request.patientId,
      leadId: request.leadId,
    };

    const tools: Anthropic.Tool[] = this.toolExecutor
      .getToolDefinitions()
      .map((d) => ({
        name: d.name,
        description: d.description,
        input_schema: d.inputSchema as Anthropic.Tool.InputSchema,
      }));

    const system: Anthropic.TextBlockParam[] = [
      {
        type: 'text',
        text: buildSystemPrompt(request.systemPrompt),
        cache_control: { type: 'ephemeral' },
      },
    ];

    const messages: Anthropic.MessageParam[] = request.history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const maxTokens = request.maxTokens ?? DEFAULT_MAX_TOKENS;
    const toolsUsed: string[] = [];
    let handoff = false;

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const response = await client.messages.create({
        model: request.model,
        max_tokens: maxTokens,
        system,
        messages,
        tools,
      });

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      if (response.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) {
        const text = this.extractText(response.content);
        return { text: text || null, handoff, toolsUsed };
      }

      // Asistan turunu (text + tool_use) geçmişe ekle (yalnız ihtiyaç duyulan bloklar).
      messages.push({
        role: 'assistant',
        content: this.toAssistantContent(response.content),
      });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolUseBlocks) {
        toolsUsed.push(block.name);
        const result = await this.toolExecutor.execute(
          {
            name: block.name,
            input: (block.input ?? {}) as Record<string, unknown>,
          },
          toolContext
        );
        if (result.isHandoff) handoff = true;
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result.content,
        });
      }
      messages.push({ role: 'user', content: toolResults });
    }

    this.logger.warn(
      `AI araç döngüsü limiti aşıldı (clinicId=${request.clinicId}); insana devrediliyor.`
    );
    return { text: null, handoff: true, toolsUsed };
  }

  private extractText(content: Anthropic.ContentBlock[]): string {
    return content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
  }

  private toAssistantContent(
    content: Anthropic.ContentBlock[]
  ): Anthropic.ContentBlockParam[] {
    const blocks: Anthropic.ContentBlockParam[] = [];
    for (const b of content) {
      if (b.type === 'text') {
        blocks.push({ type: 'text', text: b.text });
      } else if (b.type === 'tool_use') {
        blocks.push({
          type: 'tool_use',
          id: b.id,
          name: b.name,
          input: b.input,
        });
      }
    }
    return blocks;
  }
}
