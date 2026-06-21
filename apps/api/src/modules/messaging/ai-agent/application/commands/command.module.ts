import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigureClinicAiAgentHandler } from './configure-clinic-ai-agent/configure-clinic-ai-agent.handler';
import { SetClinicAiAgentEnabledHandler } from './set-clinic-ai-agent-enabled/set-clinic-ai-agent-enabled.handler';
import { ClinicAiAgentConfigRepositoryModule } from '@modules/messaging/ai-agent/infrastructure/persistence/prisma/repositories/clinic-ai-agent-config/clinic-ai-agent-config.repository.module';

const CommandHandlers = [
  ConfigureClinicAiAgentHandler,
  SetClinicAiAgentEnabledHandler,
];

@Module({
  imports: [CqrsModule, ClinicAiAgentConfigRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class AiAgentCommandModule {}
