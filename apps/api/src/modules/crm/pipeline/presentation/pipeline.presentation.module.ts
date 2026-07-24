import { Module } from '@nestjs/common';
import { PipelineController } from './controllers/pipeline.controller';
import { PipelineCommandModule } from '@modules/crm/pipeline/application/commands/command.module';
import { PipelineQueryModule } from '@modules/crm/pipeline/application/queries/query.module';

@Module({
  imports: [PipelineCommandModule, PipelineQueryModule],
  controllers: [PipelineController],
})
export class PipelinePresentationModule {}
