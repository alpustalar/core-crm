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
import { AiToolSupport } from '@modules/platform/ai-tools/application/ai-tool.support';
import { GetProviderAvailabilityQuery } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.query';
import { GetProviderAvailabilityDto } from '@shared/modules/appointment/dto/queries/get-provider-availability.dto';

const CheckProviderAvailabilityInputSchema = z.object({
  providerId: z.string().trim().min(1),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1),
});

/** Bir doktorun tarih aralığındaki çalışma günleri/saatleri + dolu slotlarını döner. */
@AiTool()
@Injectable()
export class CheckProviderAvailabilityTool implements IAiSubToolHandler {
  constructor(
    private readonly queryBus: TSQueryBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.CHECK_PROVIDER_AVAILABILITY;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.CHECK_PROVIDER_AVAILABILITY,
      description:
        'Bir doktorun verilen tarih aralığındaki çalışma günleri, çalışma saatleri ve dolu slotlarını döner. Önce list_providers ile providerId al.',
      inputSchema: {
        type: 'object',
        properties: {
          providerId: {
            type: 'string',
            description: "Doktorun id'si (list_providers çıktısından).",
          },
          startDate: {
            type: 'string',
            description: 'Başlangıç tarihi, ISO formatı (YYYY-MM-DD).',
          },
          endDate: {
            type: 'string',
            description: 'Bitiş tarihi, ISO formatı (YYYY-MM-DD).',
          },
        },
        required: ['providerId', 'startDate', 'endDate'],
        additionalProperties: false,
      },
    };
  }

  async execute(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.support.buildClinicContext(context);
    const parsed = CheckProviderAvailabilityInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        content:
          'Müsaitlik sorgusu için doktor, başlangıç ve bitiş tarihi gerekli.',
      };
    }
    const { providerId, startDate, endDate } = parsed.data;

    const dto: GetProviderAvailabilityDto = {
      providerId,
      clinicId: context.clinicId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    } as GetProviderAvailabilityDto;

    const { data: days } = await this.queryBus.execute(
      new GetProviderAvailabilityQuery(dto, ctx)
    );

    const workingDays = days
      .filter((d) => d.isWorkingDay)
      .map((d) => ({
        date: d.date,
        workingHours: d.workingHours,
        occupiedSlots: d.occupiedSlots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      }));

    return { content: JSON.stringify({ workingDays }) };
  }
}
