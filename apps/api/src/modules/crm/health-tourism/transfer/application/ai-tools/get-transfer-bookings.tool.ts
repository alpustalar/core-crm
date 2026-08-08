import { Injectable } from '@nestjs/common';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { AiTool, IAiSubToolHandler } from '@common/ai-tools';
import { AI_TOOL_NAMES } from '@common/ai-tools';
import { AiToolSupport } from '@modules/platform/ai-tools/application/ai-tool.support';

/** Yazışmaya bağlı hastanın/lead'in aktif transfer rezervasyonlarını listeler. */
@AiTool()
@Injectable()
export class GetTransferBookingsTool implements IAiSubToolHandler {
  constructor(private readonly support: AiToolSupport) {}

  get name(): string {
    return AI_TOOL_NAMES.GET_TRANSFER_BOOKINGS;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.GET_TRANSFER_BOOKINGS,
      description:
        "Yazışmadaki hastanın/lead'in mevcut transfer rezervasyonlarını listeler. İptal için doğru referans gerektiğinde de kullan. Parametre alma; her zaman bu yazışmaya bağlı kişinin rezervasyonlarını döner.",
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
    if (!context.patientId && !context.leadId) {
      return {
        content:
          'Bu yazışma bir kayda bağlı olmadığından transfer rezervasyonu listelenemedi.',
      };
    }

    const items = await this.support.loadOwnedTransferBookings(context);
    const bookings = items
      .filter((b) => b.status !== 'CANCELLED')
      .map((b) => ({
        reference: b.reference,
        status: b.status,
        holderName: `${b.holderName} ${b.holderSurname}`,
      }));

    if (bookings.length === 0) {
      return { content: 'Aktif transfer rezervasyonunuz bulunmuyor.' };
    }
    return { content: JSON.stringify({ bookings }) };
  }
}
