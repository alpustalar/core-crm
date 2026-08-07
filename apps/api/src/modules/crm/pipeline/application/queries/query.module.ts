import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GetPipelinesHandler } from './get-pipelines/get-pipelines.handler';
import { GetPipelineByIdHandler } from './get-pipeline-by-id/get-pipeline-by-id.handler';
import { GetPipelineStageByIdHandler } from './get-pipeline-stage-by-id/get-pipeline-stage-by-id.handler';
import { GetDefaultPipelineHandler } from './get-default-pipeline/get-default-pipeline.handler';
import { PipelineRepositoriesModule } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/repositories.module';

export const PIPELINE_QUERY_HANDLERS = [
  GetPipelinesHandler,
  GetPipelineByIdHandler,
  GetPipelineStageByIdHandler,
  GetDefaultPipelineHandler,
];

@Module({
  imports: [CqrsModule, PipelineRepositoriesModule],
  providers: PIPELINE_QUERY_HANDLERS,
  exports: PIPELINE_QUERY_HANDLERS,
})
export class PipelineQueryModule {}
