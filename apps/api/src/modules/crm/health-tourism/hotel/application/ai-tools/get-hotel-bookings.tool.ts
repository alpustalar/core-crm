import { Injectable } from '@nestjs/common';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { AiTool, IAiSubToolHandler } from '@common/ai-tools';
import { AI_TOOL_NAMES } from '@common/ai-tools';
import { AiToolSupport } from '@modules/platform/ai-tools/application/ai-tool.support';

/** Yazışmaya bağlı hastanın/lead'in aktif otel rezervasyonlarını listeler. */
@AiTool()
@Injectable()
export class GetHotelBookingsTool implements IAiSubToolHandler {
  constructor(private readonly support: AiToolSupport) {}

  get name(): string {
    return AI_TOOL_NAMES.GET_HOTEL_BOOKINGS;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.GET_HOTEL_BOOKINGS,
      description:
        "Yazışmadaki hastanın/lead'in mevcut otel rezervasyonlarını listeler. İptal için doğru rezervasyon kimliği (id) gerektiğinde de kullan. Parametre alma; her zaman bu yazışmaya bağlı kişinin rezervasyonlarını döner.",
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
          'Bu yazışma bir kayda bağlı olmadığından otel rezervasyonu listelenemedi.',
      };
    }

    const { data } = await this.support.loadOwnedHotelBookings(context);
    const bookings = data
      .filter((b) => b.status !== 'CANCELLED')
      .map((b) => ({
        id: b.id,
        reference: b.reference,
        hotelCode: b.hotelCode,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
      }));

    if (bookings.length === 0) {
      return { content: 'Aktif otel rezervasyonunuz bulunmuyor.' };
    }
    return { content: JSON.stringify({ bookings }) };
  }
}
