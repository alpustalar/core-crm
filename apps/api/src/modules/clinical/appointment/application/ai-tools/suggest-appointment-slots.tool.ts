import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@modules/messaging/ai-agent/domain/ports/ai-tool.port';
import {
  AiTool,
  IAiSubToolHandler,
} from '@modules/messaging/ai-agent/domain/ports/ai-sub-tool.port';
import { AI_TOOL_NAMES } from '@modules/messaging/ai-agent/infrastructure/ai-tools/ai-tool.definitions';
import { AiToolSupport } from '@modules/messaging/ai-agent/infrastructure/ai-tools/ai-tool.support';
import { GetProviderOpenSlotsQuery } from '@modules/clinical/appointment/application/queries/get-provider-open-slots/get-provider-open-slots.query';

const SuggestAppointmentSlotsInputSchema = z.object({
  providerId: z.string().trim().min(1),
  date: z.string().trim().min(1),
  durationMinutes: z.number().positive().optional(),
});

/**
 * Bir doktorun verilen gündeki hazır boş slotlarını (klinik yerel saatinde) döner.
 * AI bu çıktıyı doğrudan hastaya sunar — boş slot aritmetiği LLM'e bırakılmaz.
 */
@AiTool()
@Injectable()
export class SuggestAppointmentSlotsTool implements IAiSubToolHandler {
  constructor(
    private readonly queryBus: TSQueryBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.SUGGEST_APPOINTMENT_SLOTS;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.SUGGEST_APPOINTMENT_SLOTS,
      description:
        'Bir doktorun verilen GÜNDEKİ sunmaya hazır BOŞ randevu saatlerini döner (klinik yerel saatinde, örn. ["14:00","14:30"]). Hastaya saat önermek için check_provider_availability yerine BUNU kullan — boş slot hesabını sen yapma. Önce list_providers ile providerId al.',
      inputSchema: {
        type: 'object',
        properties: {
          providerId: {
            type: 'string',
            description: "Doktorun id'si (list_providers çıktısından).",
          },
          date: {
            type: 'string',
            description:
              'Slotların aranacağı gün, klinik yerel tarihi (YYYY-MM-DD).',
          },
          durationMinutes: {
            type: 'number',
            description:
              "Randevu süresi (dakika), 5'in katı. Slot adımı budur. Belirsizse 30.",
          },
        },
        required: ['providerId', 'date', 'durationMinutes'],
        additionalProperties: false,
      },
    };
  }

  async execute(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.support.buildClinicContext(context);
    const parsed = SuggestAppointmentSlotsInputSchema.safeParse(input);
    if (!parsed.success) {
      return { content: 'Slot araması için geçerli doktor ve tarih gerekli.' };
    }
    const { providerId, date } = parsed.data;
    const durationMinutes = parsed.data.durationMinutes ?? 30;

    const { data: slots } = await this.queryBus.execute(
      new GetProviderOpenSlotsQuery(
        { providerId, clinicId: context.clinicId, date, durationMinutes },
        ctx
      )
    );

    if (slots.length === 0) {
      return {
        content: JSON.stringify({
          date,
          slots: [],
          message: 'Bu güne ait sunulabilecek boş randevu saati bulunmuyor.',
        }),
      };
    }

    return {
      content: JSON.stringify({
        date,
        durationMinutes,
        slots: slots.map((s) => s.time),
      }),
    };
  }
}
