import { Module } from '@nestjs/common';
import { CreatePipelineHandler } from './create-pipeline/create-pipeline.handler';
import { AddPipelineStageHandler } from './add-pipeline-stage/add-pipeline-stage.handler';
import { UpdatePipelineStageHandler } from './update-pipeline-stage/update-pipeline-stage.handler';
import { DeletePipelineStageHandler } from './delete-pipeline-stage/delete-pipeline-stage.handler';
import { PipelineInfrastructureModule } from '@modules/crm/pipeline/infrastructure/infrastructure.module';

const PIPELINE_COMMAND_HANDLERS = [
  CreatePipelineHandler,
  AddPipelineStageHandler,
  UpdatePipelineStageHandler,
  DeletePipelineStageHandler,
];

@Module({
  imports: [PipelineInfrastructureModule],
  providers: PIPELINE_COMMAND_HANDLERS,
  exports: PIPELINE_COMMAND_HANDLERS,
})
export class PipelineCommandModule {}
