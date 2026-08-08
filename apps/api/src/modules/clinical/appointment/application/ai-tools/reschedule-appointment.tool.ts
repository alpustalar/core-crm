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
import { DateTimeManager } from '@common/utils';
import { StaffRescheduleDto } from '@shared';
import { StaffRescheduleCommand } from '@modules/clinical/appointment/application/commands/staff-reschedule/staff-reschedule.command';

const RescheduleAppointmentInputSchema = z.object({
  appointmentId: z.string().trim().min(1),
  newDate: z.string().trim().min(1),
  newTime: z.string().trim().min(1),
  newDurationMinutes: z.number().positive().optional(),
});

/**
 * Yazışmaya bağlı hastanın KENDİ randevusunu yeni tarih/saate erteler. Doktor korunur;
 * süre belirtilmezse mevcut randevu süresi kullanılır. Sahiplik doğrulaması zorunludur.
 */
@AiTool()
@Injectable()
export class RescheduleAppointmentTool implements IAiSubToolHandler {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.RESCHEDULE_APPOINTMENT;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.RESCHEDULE_APPOINTMENT,
      description:
        'Yazışmadaki hastanın KENDİ mevcut randevusunu yeni tarih/saate erteler. appointmentId için önce get_patient_appointments kullan; yeni saatin müsaitliğini suggest_appointment_slots ile doğrula. Doktor aynı kalır. Yalnızca bu yazışmaya bağlı hastanın randevusu ertelenebilir. Tarih ve saati KLİNİK YEREL saatiyle ver (UTC çevirme YAPMA).',
      inputSchema: {
        type: 'object',
        properties: {
          appointmentId: {
            type: 'string',
            description:
              "Ertelenecek randevunun benzersiz ID'si (get_patient_appointments çıktısından).",
          },
          newDate: {
            type: 'string',
            description: 'Yeni randevu günü, klinik yerel tarihi (YYYY-MM-DD).',
          },
          newTime: {
            type: 'string',
            description:
              'Yeni başlangıç saati, klinik yerel saati (HH:mm, örn. "14:30"). suggest_appointment_slots çıktısındaki bir değer olmalı.',
          },
          newDurationMinutes: {
            type: 'number',
            description:
              "Yeni süre (dakika), 5'in katı. Belirtilmezse mevcut randevunun süresi korunur.",
          },
        },
        required: ['appointmentId', 'newDate', 'newTime'],
        additionalProperties: false,
      },
    };
  }

  async execute(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.support.buildClinicContext(context);
    const parsed = RescheduleAppointmentInputSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.appointmentId) {
        return {
          content: 'Erteleme için geçerli bir randevu kimliği gerekli.',
        };
      }
      return { content: 'Erteleme için yeni tarih ve saat gerekli.' };
    }
    const { appointmentId, newDate, newTime } = parsed.data;

    const owned = await this.support.loadOwnedAppointment(
      appointmentId,
      context
    );
    if (!owned) {
      return {
        content:
          'Bu randevuyu adınıza doğrulayamadım; yalnızca size ait randevuyu erteleyebilirim.',
      };
    }

    const durationMinutes =
      parsed.data.newDurationMinutes ??
      DateTimeManager.diffInMinutes(owned.endTime, owned.startTime);

    // Yerel tarih+saat → klinik timezone üzerinden UTC (LLM çevirmez).
    const tz = await this.support.getClinicTimezone(context);
    const startTime = DateTimeManager.fromLocalDateTime(newDate, newTime, tz);

    const dto: StaffRescheduleDto = {
      appointmentId,
      providerId: owned.providerId,
      startTime,
      duration: durationMinutes,
    } as StaffRescheduleDto;

    await this.commandBus.execute(new StaffRescheduleCommand(dto, ctx));

    return {
      content: JSON.stringify({
        success: true,
        message: 'Randevunuz yeni tarih/saate güncellendi.',
      }),
    };
  }
}
