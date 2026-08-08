import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { AiTool, IAiSubToolHandler } from '@common/ai-tools';
import { AI_TOOL_NAMES } from '@common/ai-tools';
import { FindProvidersDirectoryQuery } from '@modules/clinical/provider/application/queries/find-providers-directory/find-providers-directory.query';

const GetProviderDetailsInputSchema = z.object({
  providerId: z.string().trim().min(1),
});

/** Tek bir doktorun ad/uzmanlık/unvan bilgisini döner (uzmanı hastaya tanıtmak için). */
@AiTool()
@Injectable()
export class GetProviderDetailsTool implements IAiSubToolHandler {
  constructor(private readonly queryBus: TSQueryBus) {}

  get name(): string {
    return AI_TOOL_NAMES.GET_PROVIDER_DETAILS;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.GET_PROVIDER_DETAILS,
      description:
        'Belirli bir doktorun adını, uzmanlık alanını ve unvanını döner. Eşleştirilen uzmanı hastaya tanıtmak/bilgilendirmek için (randevu öncesi) kullan. providerId list_providers çıktısından gelir.',
      inputSchema: {
        type: 'object',
        properties: {
          providerId: {
            type: 'string',
            description: "Doktorun id'si (list_providers çıktısından).",
          },
        },
        required: ['providerId'],
        additionalProperties: false,
      },
    };
  }

  async execute(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const parsed = GetProviderDetailsInputSchema.safeParse(input);
    if (!parsed.success) {
      return { content: 'Geçerli bir doktor kimliği gerekli.' };
    }
    const { providerId } = parsed.data;

    const { data: providers } = await this.queryBus.execute(
      new FindProvidersDirectoryQuery(context.clinicId)
    );
    const provider = providers.find((p) => p.providerId === providerId);
    if (!provider) {
      return { content: 'Doktor bulunamadı.' };
    }

    return {
      content: JSON.stringify({
        provider: {
          id: provider.providerId,
          name: provider.name,
          specialty: provider.specialty,
          title: provider.title,
        },
      }),
    };
  }
}
