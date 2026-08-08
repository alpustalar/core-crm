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
import { AppointmentSlot } from '@shared';
import { BookAppointmentByContactCommand } from '@modules/clinical/appointment/application/commands/book-appointment-by-contact/book-appointment-by-contact.command';
import { LockAppointmentSlotCommand } from '@modules/clinical/appointment/application/commands/lock-appointment-slot/lock-appointment-slot.command';
import { ReleaseAppointmentSlotCommand } from '@modules/clinical/appointment/application/commands/release-appointment-slot/release-appointment-slot.command';
import { SlotTemporarilyHeldException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

const BookAppointmentInputSchema = z.object({
  providerId: z.string().trim().min(1),
  patientName: z.string().trim().min(1),
  patientPhone: z.string().trim().min(1).optional(),
  date: z.string().trim().min(1),
  time: z.string().trim().min(1),
  durationMinutes: z.number().positive().optional(),
});

/**
 * AI üzerinden randevu açar. Hasta kaydı telefondan çözülür; yoksa handler içinde
 * (CreatePatientCommand ile) oluşturulur. Tüm iş kuralları (klinik ayar geçidi, klinik/
 * doktor müsaitliği, çakışma) BookAppointmentByContactHandler'da uygulanır; kaynak
 * entegrasyon/AI olarak işaretlenir. Yerel tarih+saat klinik timezone'undan UTC'ye çevrilir.
 * Booking'ten önce slot yazışma (conversationId) adına kısa süre kilitlenir.
 */
@AiTool()
@Injectable()
export class BookAppointmentTool implements IAiSubToolHandler {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.BOOK_APPOINTMENT;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.BOOK_APPOINTMENT,
      description:
        'Hasta için randevu oluşturur. Yalnızca hastadan doktor, tarih/saat ve süre için açık onay aldıktan sonra çağır. Saati önce suggest_appointment_slots ile doğrula. Tarih ve saati KLİNİK YEREL saatiyle ver (UTC çevirme YAPMA; sistem otomatik çevirir).',
      inputSchema: {
        type: 'object',
        properties: {
          providerId: {
            type: 'string',
            description: 'Randevunun doktoru (list_providers çıktısından).',
          },
          patientName: {
            type: 'string',
            description: 'Hastanın adı soyadı.',
          },
          patientPhone: {
            type: 'string',
            description:
              'Hastanın telefon numarası (boş bırakılırsa kişinin WhatsApp numarası kullanılır).',
          },
          date: {
            type: 'string',
            description: 'Randevu günü, klinik yerel tarihi (YYYY-MM-DD).',
          },
          time: {
            type: 'string',
            description:
              'Randevu başlangıç saati, klinik yerel saati (HH:mm, örn. "14:30"). suggest_appointment_slots çıktısındaki bir değer olmalı.',
          },
          durationMinutes: {
            type: 'number',
            description: "Randevu süresi (dakika), 5'in katı. Belirsizse 30.",
          },
        },
        required: [
          'providerId',
          'patientName',
          'date',
          'time',
          'durationMinutes',
        ],
        additionalProperties: false,
      },
    };
  }

  async execute(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const ctx = this.support.buildClinicContext(context);

    const parsed = BookAppointmentInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        content: 'Randevu için doktor, hasta adı, tarih ve saat gerekli.',
      };
    }
    const { providerId, patientName, date, time } = parsed.data;
    const durationMinutes = parsed.data.durationMinutes ?? 30;

    // WhatsApp'ta contactPhone doğrulanmış numaradır; hasta farklı numara verdiyse o kullanılır.
    const patientPhone = parsed.data.patientPhone ?? context.contactPhone;
    if (!patientPhone) {
      return { content: 'Randevu için telefon numarası gerekli.' };
    }

    // Yerel tarih+saat → klinik timezone üzerinden UTC (LLM çevirmez).
    const tz = await this.support.getClinicTimezone(context);
    const startTime = DateTimeManager.fromLocalDateTime(date, time, tz);

    // AI akışı: slotu yazışma (conversationId) adına kısa süre kilitle — eşzamanlı
    // başka bir yazışma/portal aynı anı kapmasın. Kilit alınamazsa (başkası tutuyor)
    // hastaya "az önce doldu" mesajı döner; alındıysa booking sonrası serbest bırakılır.
    const slot: AppointmentSlot = { providerId, startTime };
    try {
      await this.commandBus.execute(
        new LockAppointmentSlotCommand({
          data: slot,
          ctx,
          holderId: context.conversationId,
        })
      );
    } catch (error) {
      if (error instanceof SlotTemporarilyHeldException) {
        return {
          content:
            'Bu saat şu anda başka bir işlemde tutuluyor. Lütfen birkaç dakika sonra tekrar deneyin ya da başka bir saat seçelim.',
        };
      }
      throw error;
    }

    try {
      const appointmentId = await this.commandBus.execute(
        new BookAppointmentByContactCommand(
          {
            clinicId: context.clinicId,
            organizationId: context.organizationId,
            providerId,
            patientName,
            patientPhone,
            startTime,
            durationMinutes,
          },
          ctx
        )
      );

      return {
        content: JSON.stringify({
          success: true,
          appointmentId,
          message: 'Randevu başarıyla oluşturuldu.',
        }),
      };
    } finally {
      // Randevu kalıcı yazıldıysa kilit gereksiz; hata olduysa başkası deneyebilsin.
      await this.commandBus
        .execute(
          new ReleaseAppointmentSlotCommand({
            data: slot,
            ctx,
            holderId: context.conversationId,
          })
        )
        .catch(() => undefined);
    }
  }
}
