import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetClinicAiAgentConfigHandler } from './get-clinic-ai-agent-config/get-clinic-ai-agent-config.handler';
import { GetAiAgentRuntimeConfigHandler } from './get-ai-agent-runtime-config/get-ai-agent-runtime-config.handler';
import { ClinicAiAgentConfigRepositoryModule } from '@modules/messaging/ai-agent/infrastructure/persistence/mongo/repositories/clinic-ai-agent-config/clinic-ai-agent-config.repository.module';

const QueryHandlers = [
  GetClinicAiAgentConfigHandler,
  GetAiAgentRuntimeConfigHandler,
];

@Module({
  imports: [CqrsModule, ClinicAiAgentConfigRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class AiAgentQueryModule {}
