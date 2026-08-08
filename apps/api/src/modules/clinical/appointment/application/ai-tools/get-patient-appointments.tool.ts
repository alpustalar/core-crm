import { Injectable } from '@nestjs/common';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { AiTool, IAiSubToolHandler } from '@common/ai-tools';
import { AI_TOOL_NAMES } from '@common/ai-tools';
import { isActiveAppointmentStatus } from '@modules/platform/ai-tools/application/ai-tool.util';
import { DateTimeManager } from '@common/utils';
import { PaginationSchema } from '@shared';
import { PaginationDto } from '@shared/common';
import { GetPatientAppointmentsQuery } from '@modules/clinical/appointment/application/queries/get-patient-appointments/get-patient-appointments.query';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';

/**
 * Yazışmaya bağlı hastanın yaklaşan (aktif) randevularını listeler. Gizlilik gereği
 * telefon/parametre almaz; yalnız context.patientId kapsamında çalışır. Misafir
 * yazışmalarda randevu döndürmez.
 */
@AiTool()
@Injectable()
export class GetPatientAppointmentsTool implements IAiSubToolHandler {
  constructor(private readonly queryBus: TSQueryBus) {}

  get name(): string {
    return AI_TOOL_NAMES.GET_PATIENT_APPOINTMENTS;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.GET_PATIENT_APPOINTMENTS,
      description:
        'Yazışmadaki hastanın yaklaşan (aktif) randevularını listeler. Hasta randevusunu sorduğunda, unuttuğunda ya da iptal/erteleme için doğru appointmentId gerektiğinde kullan. Telefon/parametre alma; her zaman bu yazışmaya bağlı hastanın randevularını döner. Yazışma bir hasta kaydına bağlı değilse randevu listelenemez.',
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
    if (!context.patientId) {
      return {
        content:
          'Bu yazışma bir hasta kaydına bağlı olmadığından randevu listelenemedi.',
      };
    }

    const pagination = PaginationSchema.parse({
      page: 1,
      limit: 50,
    }) as PaginationDto;

    const { data: appointments } = await this.queryBus.execute(
      new GetPatientAppointmentsQuery({
        patientId: context.patientId,
        pagination,
        ctx: ExecutionContextFactory.createPatientInternal(),
      })
    );

    const now = DateTimeManager.create();
    const upcoming = appointments
      .filter((a) => a.startTime >= now && isActiveAppointmentStatus(a.status))
      .map((a) => ({
        appointmentId: a.id,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        treatmentType: a.treatmentType,
      }));

    if (upcoming.length === 0) {
      return { content: 'Yaklaşan aktif bir randevunuz bulunmuyor.' };
    }
    return { content: JSON.stringify({ appointments: upcoming }) };
  }
}
