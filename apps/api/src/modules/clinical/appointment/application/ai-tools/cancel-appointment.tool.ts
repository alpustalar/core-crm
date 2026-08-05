import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
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
import { createPatientActorContext } from '@modules/messaging/ai-agent/infrastructure/ai-tools/ai-tool.util';
import { PatientCancelAppointmentCommand } from '@modules/clinical/appointment/application/commands/patient-cancel-appointment/patient-cancel-appointment.command';
import { CancelAppointment } from '@shared/modules/appointment/types/commands/cancel-appointment.type';

const CancelAppointmentInputSchema = z.object({
  appointmentId: z.string().trim().min(1),
  reason: z.string().trim().min(1).optional(),
});

/**
 * Yazışmaya bağlı hastanın KENDİ randevusunu iptal eder. Sahiplik doğrulaması burada
 * yapılır (handler sistem kaynağında policy'yi bypass ettiği için güvenlik sınırı budur).
 * 2 saatten az kala anında iptal yerine ekibe iptal talebi iletilir.
 */
@AiTool()
@Injectable()
export class CancelAppointmentTool implements IAiSubToolHandler {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.CANCEL_APPOINTMENT;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.CANCEL_APPOINTMENT,
      description:
        'Yazışmadaki hastanın KENDİ mevcut randevusunu iptal eder. appointmentId için önce get_patient_appointments ile hastanın randevularını listele. Yalnızca bu yazışmaya bağlı hastanın randevuları iptal edilebilir. Randevuya 2 saatten az kaldıysa anında iptal yerine ekibe iptal talebi iletilir. İptal nedenini (reason) hastadan nezaketle öğrenmeye çalış.',
      inputSchema: {
        type: 'object',
        properties: {
          appointmentId: {
            type: 'string',
            description:
              "İptal edilecek randevunun benzersiz ID'si (get_patient_appointments çıktısından).",
          },
          reason: {
            type: 'string',
            description: 'Hastanın randevuyu iptal etme gerekçesi.',
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
    const parsed = CancelAppointmentInputSchema.safeParse(input);
    if (!parsed.success) {
      return { content: 'İptal için geçerli bir randevu kimliği gerekli.' };
    }
    const { appointmentId, reason } = parsed.data;

    const owned = await this.support.loadOwnedAppointment(
      appointmentId,
      context
    );
    if (!owned) {
      return {
        content:
          'Bu randevuyu adınıza doğrulayamadım; yalnızca size ait randevuları iptal edebilirim.',
      };
    }

    const cancelAppointmentData: CancelAppointment = {
      appointmentId,
      cancelReason: reason,
    };

    const patientActorContext = createPatientActorContext({
      phone: context.contactPhone,
      clinicId: context.clinicId,
      organizationId: context.organizationId,
      patientId: context.patientId!,
      firstName: context.contactName ?? 'Hasta',
    });

    const result = await this.commandBus.execute(
      new PatientCancelAppointmentCommand(
        cancelAppointmentData,
        patientActorContext
      )
    );

    const message =
      result.status === 'CANCELLATION_REQUESTED'
        ? 'Randevunuza 2 saatten az kaldığı için iptal talebiniz klinik ekibine iletildi; en kısa sürede teyit edilecektir.'
        : 'Randevunuz başarıyla iptal edildi.';

    return { content: JSON.stringify({ status: result.status, message }) };
  }
}
