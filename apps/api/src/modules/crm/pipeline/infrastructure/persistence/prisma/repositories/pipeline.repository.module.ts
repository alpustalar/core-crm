import { Module } from '@nestjs/common';
import {
  PIPELINE_COMMAND_REPOSITORY,
  PIPELINE_QUERY_REPOSITORY,
  PIPELINE_STAGE_COMMAND_REPOSITORY,
} from '@modules/crm/pipeline/domain/repositories/pipeline.repository';
import { PipelineCommandRepository } from './pipeline.command.repository';
import { PipelineStageCommandRepository } from './pipeline-stage.command.repository';
import { PipelineQueryRepository } from './pipeline.query.repository';

@Module({
  providers: [
    { provide: PIPELINE_COMMAND_REPOSITORY, useClass: PipelineCommandRepository },
    {
      provide: PIPELINE_STAGE_COMMAND_REPOSITORY,
      useClass: PipelineStageCommandRepository,
    },
    { provide: PIPELINE_QUERY_REPOSITORY, useClass: PipelineQueryRepository },
  ],
  exports: [
    PIPELINE_COMMAND_REPOSITORY,
    PIPELINE_STAGE_COMMAND_REPOSITORY,
    PIPELINE_QUERY_REPOSITORY,
  ],
})
export class PipelineRepositoryModule {}
