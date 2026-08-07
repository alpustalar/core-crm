import { Module } from '@nestjs/common';
import { PipelineStageRepositoryModule } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/pipeline-stage/pipeline-stage.repository.module';
import { PipelineRepositoryModule } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/pipeline/pipeline.repository.module';

const RepositoriesModules = [
  PipelineRepositoryModule,
  PipelineStageRepositoryModule,
];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class PipelineRepositoriesModule {}
