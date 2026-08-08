import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY,
  IClinicAiAgentConfigQueryRepository,
} from '@modules/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { GetClinicAiAgentConfigQuery } from './get-clinic-ai-agent-config.query';
import { GetClinicAiAgentConfigResponse } from './get-clinic-ai-agent-config.response';

@QueryHandler(GetClinicAiAgentConfigQuery)
export class GetClinicAiAgentConfigHandler implements IQueryHandler<
  GetClinicAiAgentConfigQuery,
  GetClinicAiAgentConfigResponse
> {
  constructor(
    @Inject(CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY)
    private readonly configQueryRepo: IClinicAiAgentConfigQueryRepository
  ) {}

  async execute(
    query: GetClinicAiAgentConfigQuery
  ): Promise<GetClinicAiAgentConfigResponse> {
    const config = await this.configQueryRepo.findByClinicId(query.clinicId);
    if (!config) return { data: null };

    return {
      data: {
        id: config.id,
        clinicId: config.clinicId,
        isEnabled: config.isEnabled,
        provider: config.provider,
        model: config.model,
        systemPrompt: config.systemPrompt,
        hasApiKey: config.apiKey !== null,
        maxTokens: config.maxTokens,
        replyOnlyWithinWindow: config.replyOnlyWithinWindow,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    };
  }
}
