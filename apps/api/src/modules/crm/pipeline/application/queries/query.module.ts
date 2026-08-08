import { Module } from '@nestjs/common';

import { GetPipelinesHandler } from './get-pipelines/get-pipelines.handler';
import { GetPipelineByIdHandler } from './get-pipeline-by-id/get-pipeline-by-id.handler';
import { GetPipelineStageByIdHandler } from './get-pipeline-stage-by-id/get-pipeline-stage-by-id.handler';
import { GetDefaultPipelineHandler } from './get-default-pipeline/get-default-pipeline.handler';
import { PipelineRepositoriesModule } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/repositories.module';

const PIPELINE_QUERY_HANDLERS = [
  GetPipelinesHandler,
  GetPipelineByIdHandler,
  GetPipelineStageByIdHandler,
  GetDefaultPipelineHandler,
];

@Module({
  imports: [PipelineRepositoriesModule],
  providers: PIPELINE_QUERY_HANDLERS,
  exports: PIPELINE_QUERY_HANDLERS,
})
export class PipelineQueryModule {}
