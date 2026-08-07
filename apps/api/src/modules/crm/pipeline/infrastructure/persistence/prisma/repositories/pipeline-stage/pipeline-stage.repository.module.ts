import { Module } from '@nestjs/common';
import { PipelineStageCommandRepository } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/pipeline-stage/pipeline-stage.command.repository';
import { PIPELINE_STAGE_COMMAND_REPOSITORY } from '@modules/crm/pipeline/domain/repositories/pipeline-stage/pipeline-stage.command.repository';

@Module({
  providers: [
    {
      provide: PIPELINE_STAGE_COMMAND_REPOSITORY,
      useClass: PipelineStageCommandRepository,
    },
  ],
  exports: [PIPELINE_STAGE_COMMAND_REPOSITORY],
})
export class PipelineStageRepositoryModule {}
