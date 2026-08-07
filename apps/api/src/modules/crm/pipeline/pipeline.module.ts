import { Module } from '@nestjs/common';
import { PipelinePresentationModule } from './presentation/presentation.module';
import { PipelineApplicationModule } from '@modules/crm/pipeline/application/application.module';
import { PipelineInfrastructureModule } from '@modules/crm/pipeline/infrastructure/infrastructure.module';

@Module({
  imports: [
    PipelinePresentationModule,
    PipelineApplicationModule,
    PipelineInfrastructureModule,
  ],
})
export class PipelineModule {}
