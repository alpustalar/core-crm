import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import {
  CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY,
  IClinicAiAgentConfigQueryRepository,
} from '@modules/messaging/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { GetAiAgentRuntimeConfigQuery } from './get-ai-agent-runtime-config.query';
import { GetAiAgentRuntimeConfigResponse } from './get-ai-agent-runtime-config.response';

@QueryHandler(GetAiAgentRuntimeConfigQuery)
export class GetAiAgentRuntimeConfigHandler
  implements
    IQueryHandler<
      GetAiAgentRuntimeConfigQuery,
      GetAiAgentRuntimeConfigResponse
    >
{
  constructor(
    @Inject(CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY)
    private readonly configQueryRepo: IClinicAiAgentConfigQueryRepository,
    private readonly cipher: TokenCipherService
  ) {}

  async execute(
    query: GetAiAgentRuntimeConfigQuery
  ): Promise<GetAiAgentRuntimeConfigResponse> {
    const config = await this.configQueryRepo.findByClinicId(query.clinicId);
    if (!config) return { data: null };

    return {
      data: {
        isEnabled: config.isEnabled,
        model: config.model,
        systemPrompt: config.systemPrompt,
        maxTokens: config.maxTokens,
        replyOnlyWithinWindow: config.replyOnlyWithinWindow,
        apiKey: config.apiKey ? this.cipher.decrypt(config.apiKey) : null,
      },
    };
  }
}
