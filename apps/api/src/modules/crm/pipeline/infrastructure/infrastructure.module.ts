import { Module } from '@nestjs/common';
import { PipelineRepositoriesModule } from '@modules/crm/pipeline/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [PipelineRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class PipelineInfrastructureModule {}
