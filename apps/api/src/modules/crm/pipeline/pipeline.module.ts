import { Module } from '@nestjs/common';
import { PipelinePresentationModule } from './presentation/pipeline.presentation.module';
import { PipelineCommandModule } from './application/commands/command.module';
import { PipelineQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    PipelinePresentationModule,
    PipelineCommandModule,
    PipelineQueryModule,
  ],
  exports: [PipelineCommandModule, PipelineQueryModule],
})
export class PipelineModule {}
