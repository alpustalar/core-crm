import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CLINIC_AI_AGENT_CONFIG_COMMAND_REPOSITORY,
  CLINIC_AI_AGENT_CONFIG_QUERY_REPOSITORY,
} from '@modules/ai-agent/domain/repositories/clinic-ai-agent-config.repository';
import {
  ClinicAiAgentConfigModel,
  ClinicAiAgentConfigSchema,
} from '../../schemas/clinic-ai-agent-config.schema';
import { ClinicAiAgentConfigCommandRepository } from './clinic-ai-agent-config.command.repository';
import { ClinicAiAgentConfigQueryRepository } from './clinic-ai-agent-config.query.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: ClinicAiAgentConfigModel.name,
          schema: ClinicAiAgentConfigSchema,
        },
      ],
      MESSAGING_MONGO_CONNECTION
    ),
  ],
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
