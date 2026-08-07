import { Module } from '@nestjs/common';
import { PipelineQueryRepository } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/pipeline/pipeline.query.repository';
import { PipelineCommandRepository } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/pipeline/pipeline.command.repository';
import { PIPELINE_QUERY_REPOSITORY } from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.query.repository';
import { PIPELINE_COMMAND_REPOSITORY } from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.command.repository';

@Module({
  providers: [
    { provide: PIPELINE_QUERY_REPOSITORY, useClass: PipelineQueryRepository },
    {
      provide: PIPELINE_COMMAND_REPOSITORY,
      useClass: PipelineCommandRepository,
    },
  ],
  exports: [PIPELINE_COMMAND_REPOSITORY, PIPELINE_QUERY_REPOSITORY],
})
export class PipelineRepositoryModule {}
