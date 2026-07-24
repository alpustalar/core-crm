import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PipelineRepositoryModule } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/pipeline.repository.module';
import { GetPipelinesHandler } from './get-pipelines/get-pipelines.handler';
import { GetPipelineByIdHandler } from './get-pipeline-by-id/get-pipeline-by-id.handler';
import { GetPipelineStageByIdHandler } from './get-pipeline-stage-by-id/get-pipeline-stage-by-id.handler';
import { GetDefaultPipelineHandler } from './get-default-pipeline/get-default-pipeline.handler';

export const PIPELINE_QUERY_HANDLERS = [
  GetPipelinesHandler,
  GetPipelineByIdHandler,
  GetPipelineStageByIdHandler,
  GetDefaultPipelineHandler,
];

@Module({
  imports: [CqrsModule, PipelineRepositoryModule],
  providers: PIPELINE_QUERY_HANDLERS,
  exports: PIPELINE_QUERY_HANDLERS,
})
export class PipelineQueryModule {}
