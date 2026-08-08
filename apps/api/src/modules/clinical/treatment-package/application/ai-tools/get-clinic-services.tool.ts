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
import { FindTreatmentPackagesQuery } from '@modules/clinical/treatment-package/application/queries/find-treatment-packages/find-treatment-packages.query';
import { FindTreatmentPackagesDto } from '@shared/modules/treatment-package/dto/queries';

/** Kliniğin aktif tedavi/hizmet paketlerini ve fiyatlarını listeler. */
@AiTool()
@Injectable()
export class GetClinicServicesTool implements IAiSubToolHandler {
  constructor(
    private readonly queryBus: TSQueryBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.GET_CLINIC_SERVICES;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.GET_CLINIC_SERVICES,
      description:
        'Kliniğin sunduğu tedavi/hizmet paketlerini ve fiyatlarını listeler. Hasta fiyat veya hizmet sorduğunda kullan.',
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
    const ctx = this.support.buildClinicContext(context);
    const dto: FindTreatmentPackagesDto = {
      clinicId: context.clinicId,
      isActive: true,
      pagination: { page: 1, limit: 50 },
    } as FindTreatmentPackagesDto;

    const result = await this.queryBus.execute(
      new FindTreatmentPackagesQuery(dto, ctx)
    );

    const services = result.data.map((pkg) => ({
      name: pkg.name,
      price: pkg.currency,
      sessions: pkg.examinationCount + pkg.controlCount,
    }));

    if (services.length === 0) {
      return { content: 'Tanımlı hizmet/paket bulunamadı.' };
    }
    return { content: JSON.stringify({ services }) };
  }
}
