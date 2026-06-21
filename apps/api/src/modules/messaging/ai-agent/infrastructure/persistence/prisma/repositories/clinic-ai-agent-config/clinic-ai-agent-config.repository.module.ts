import { Module } from '@nestjs/common';
import {
  CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY,
  CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY,
} from '@modules/messaging/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import { ClinicAiAgentConfigCommandRepository } from './clinic-ai-agent-config.command.repository';
import { ClinicAiAgentConfigQueryRepository } from './clinic-ai-agent-config.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY,
      useClass: ClinicAiAgentConfigCommandRepository,
    },
    {
      provide: CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY,
      useClass: ClinicAiAgentConfigQueryRepository,
    },
  ],
  exports: [
    CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY,
    CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY,
  ],
})
export class ClinicAiAgentConfigRepositoryModule {}
