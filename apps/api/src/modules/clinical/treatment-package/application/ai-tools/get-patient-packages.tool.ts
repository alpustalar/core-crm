import { Injectable } from '@nestjs/common';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { AiTool, IAiSubToolHandler } from '@common/ai-tools';
import { AI_TOOL_NAMES } from '@common/ai-tools';
import { AiToolSupport } from '@modules/platform/ai-tools/application/ai-tool.support';
import { PaginationSchema, PatientPackageStatusSchema } from '@shared';
import { PaginationDto } from '@shared/common';
import { FindPatientPackagesQuery } from '@modules/clinical/treatment-package/application/queries/find-patient-packages/find-patient-packages.query';
import { FindPatientPackagesDto } from '@shared/modules/treatment-package/dto/queries';

/**
 * Yazışmaya bağlı hastanın satın aldığı tedavi paketlerini ve kalan seansını listeler.
 * Gizlilik gereği yalnız context.patientId kapsamlıdır; misafir yazışmalarda paket dönmez.
 */
@AiTool()
@Injectable()
export class GetPatientPackagesTool implements IAiSubToolHandler {
  constructor(
    private readonly queryBus: TSQueryBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.GET_PATIENT_PACKAGES;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.GET_PATIENT_PACKAGES,
      description:
        'Yazışmadaki hastanın satın aldığı tedavi paketlerini ve kalan seans sayısını listeler. Hasta "kaç seansım kaldı", "paketimde ne var" gibi sorular sorduğunda kullan. Telefon/parametre alma; her zaman bu yazışmaya bağlı hastanın paketlerini döner. Yazışma bir hasta kaydına bağlı değilse paket listelenemez.',
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
          'Bu yazışma bir hasta kaydına bağlı olmadığından paketleriniz listelenemedi.',
      };
    }

    const ctx = this.support.buildClinicContext(context);
    const pagination = PaginationSchema.parse({
      page: 1,
      limit: 50,
    }) as PaginationDto;

    const dto: FindPatientPackagesDto = {
      patientId: context.patientId,
      pagination,
    } as FindPatientPackagesDto;

    const { data: packages } = await this.queryBus.execute(
      new FindPatientPackagesQuery(dto, ctx)
    );

    const result = packages.map((p) => {
      const used = p.usedExaminationCount + p.usedControlCount;
      return {
        packageName: null,
        status: p.status,
        totalSessions: null,
        usedSessions: used,
        remainingSessions: null,
        isActive: p.status === PatientPackageStatusSchema.enum.ACTIVE,
      };
    });

    if (result.length === 0) {
      return { content: 'Tanımlı bir tedavi paketiniz bulunmuyor.' };
    }
    return { content: JSON.stringify({ packages: result }) };
  }
}
