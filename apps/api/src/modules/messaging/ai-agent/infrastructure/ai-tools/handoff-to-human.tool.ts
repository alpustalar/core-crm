import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import {
  AiTool,
  IAiSubToolHandler,
} from '@modules/messaging/ai-agent/domain/ports/ai-sub-tool.port';
import { AI_TOOL_NAMES } from './ai-tool.definitions';

const HandoffToHumanInputSchema = z.object({
  reason: z.string().trim().min(1).optional(),
});

/** Yazışmayı klinik ekibine devreder (isHandoff). Bus dağıtımı yok — saf yanıt. */
@AiTool()
@Injectable()
export class HandoffToHumanTool implements IAiSubToolHandler {
  get name(): string {
    return AI_TOOL_NAMES.HANDOFF_TO_HUMAN;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.HANDOFF_TO_HUMAN,
      description:
        'Soruyu yanıtlayamadığında, hasta bir yetkiliyle/insanla görüşmek istediğinde veya tıbbi tavsiye gerektiğinde yazışmayı klinik ekibine devreder.',
      inputSchema: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Devir gerekçesinin kısa özeti (klinik ekibi için).',
          },
        },
        required: ['reason'],
        additionalProperties: false,
      },
    };
  }

  async execute(
    input: Record<string, unknown>,
    _context: AiToolContext
  ): Promise<AiToolResult> {
    const parsed = HandoffToHumanInputSchema.safeParse(input);
    const reason = (parsed.success && parsed.data.reason) || 'Belirtilmedi';
    return {
      content: JSON.stringify({
        handoff: true,
        message:
          'Yazışma klinik ekibine devredildi. En kısa sürede bir yetkili dönüş yapacaktır.',
        reason,
      }),
      isHandoff: true,
    };
  }
}
