import { Module } from '@nestjs/common';
import { AiAgentController } from './controllers/ai-agent.controller';
import { AiAgentCommandModule } from '@modules/messaging/ai-agent/application/commands/command.module';
import { AiAgentQueryModule } from '@modules/messaging/ai-agent/application/queries/query.module';

@Module({
  imports: [AiAgentCommandModule, AiAgentQueryModule],
  controllers: [AiAgentController],
})
export class AiAgentPresentationModule {}
