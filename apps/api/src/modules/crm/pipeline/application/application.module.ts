import { Module } from '@nestjs/common';
import { PipelineQueryModule } from '@modules/crm/pipeline/application/queries/query.module';
import { PipelineCommandModule } from '@modules/crm/pipeline/application/commands/command.module';

const ApplicationModules = [PipelineCommandModule, PipelineQueryModule];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class PipelineApplicationModule {}
