import { Module } from '@nestjs/common';
import { PipelineController } from './controllers/pipeline.controller';
import { PipelineApplicationModule } from '@modules/crm/pipeline/application/application.module';

@Module({
  imports: [PipelineApplicationModule],
  controllers: [PipelineController],
})
export class PipelinePresentationModule {}
