import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { AiTool, IAiSubToolHandler } from '@common/ai-tools';
import { AI_TOOL_NAMES } from '@common/ai-tools';
import { AiToolSupport } from '@modules/platform/ai-tools/application/ai-tool.support';
import { ConfirmAppointmentCommand } from '@modules/clinical/appointment/application/commands/confirm-appointment/confirm-appointment.command';

const ConfirmAppointmentInputSchema = z.object({
  appointmentId: z.string().trim().min(1),
});

/**
 * Yazışmaya bağlı hastanın KENDİ bekleyen randevusunu onaylar (PENDING → CONFIRMED).
 * Hatırlatmaya "geliyorum" yanıtı senaryosu. Sahiplik doğrulaması zorunludur; yalnız
 * bekleyen randevular onaylanabilir (entity invariant'ı handler'da korunur).
 */
@AiTool()
@Injectable()
export class ConfirmAppointmentTool implements IAiSubToolHandler {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.CONFIRM_APPOINTMENT;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.CONFIRM_APPOINTMENT,
      description:
        'Yazışmadaki hastanın KENDİ bekleyen (PENDING) randevusunu onaylar (CONFIRMED). Klinik hatırlatma gönderdikten sonra hasta "onaylıyorum / geliyorum / tamam geleceğim" dediğinde kullan. appointmentId için önce get_patient_appointments ile randevuyu bul. Yalnızca bu yazışmaya bağlı hastanın randevusu onaylanabilir; yalnızca bekleyen randevular onaylanabilir.',
      inputSchema: {
        type: 'object',
        properties: {
          appointmentId: {
            type: 'string',
            description:
              "Onaylanacak randevunun benzersiz ID'si (get_patient_appointments çıktısından).",
          },
        },
        required: ['appointmentId'],
        additionalProperties: false,
      },
    };
  }

  async execute(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.support.buildClinicContext(context);
    const parsed = ConfirmAppointmentInputSchema.safeParse(input);
    if (!parsed.success) {
      return { content: 'Onay için geçerli bir randevu kimliği gerekli.' };
    }
    const { appointmentId } = parsed.data;

    const owned = await this.support.loadOwnedAppointment(
      appointmentId,
      context
    );
    if (!owned) {
      return {
        content:
          'Bu randevuyu adınıza doğrulayamadım; yalnızca size ait randevuyu onaylayabilirim.',
      };
    }

    await this.commandBus.execute(
      new ConfirmAppointmentCommand(appointmentId, ctx)
    );

    return {
      content: JSON.stringify({
        success: true,
        message: 'Randevunuz onaylandı.',
      }),
    };
  }
}
