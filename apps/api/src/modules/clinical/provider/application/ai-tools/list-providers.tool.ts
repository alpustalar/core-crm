import { Injectable } from '@nestjs/common';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { AiTool, IAiSubToolHandler } from '@common/ai-tools';
import { AI_TOOL_NAMES } from '@common/ai-tools';
import { FindProvidersDirectoryQuery } from '@modules/clinical/provider/application/queries/find-providers-directory/find-providers-directory.query';

/**
 * Kliniğin aktif doktorlarını uzmanlık + unvan adlarıyla listeler (read-model). AI,
 * hastanın anlattığı duruma göre buradan doğru uzmanı seçer.
 */
@AiTool()
@Injectable()
export class ListProvidersTool implements IAiSubToolHandler {
  constructor(private readonly queryBus: TSQueryBus) {}

  get name(): string {
    return AI_TOOL_NAMES.LIST_PROVIDERS;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.LIST_PROVIDERS,
      description:
        'Klinikteki aktif doktorları uzmanlık alanı (specialty) ve unvanlarıyla (title) listeler. Hasta şikâyetini/durumunu anlattığında, anlattığı duruma en uygun uzmanı bu listeden seç. Doğru providerId için müsaitlik bakmadan veya randevu oluşturmadan önce kullan.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    };
  }

  async execute(
    _input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const { data: providers } = await this.queryBus.execute(
      new FindProvidersDirectoryQuery(context.clinicId)
    );

    if (providers.length === 0) {
      return { content: 'Randevu alınabilecek aktif doktor bulunamadı.' };
    }

    const list = providers.map((p) => ({
      id: p.providerId,
      name: p.name,
      specialty: p.specialty,
      title: p.title,
    }));
    return { content: JSON.stringify({ providers: list }) };
  }
}
