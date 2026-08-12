import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  AddPipelineStageDto,
  CreatePipelineDto,
  UpdatePipelineStageDto,
} from '@shared/modules/pipeline/dto/commands';
import { CreatePipelineCommand } from '@modules/crm/pipeline/application/commands/create-pipeline/create-pipeline.command';
import { AddPipelineStageCommand } from '@modules/crm/pipeline/application/commands/add-pipeline-stage/add-pipeline-stage.command';
import { UpdatePipelineStageCommand } from '@modules/crm/pipeline/application/commands/update-pipeline-stage/update-pipeline-stage.command';
import { DeletePipelineStageCommand } from '@modules/crm/pipeline/application/commands/delete-pipeline-stage/delete-pipeline-stage.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PIPELINE, PIPELINESTAGE } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class PipelineCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  // Route'lar 'pipelines' prefix'i altında (APP_ROUTES). Metod path'leri relative.
  @HasCapability(PIPELINE.create)
  @Post()
  createPipeline(
    @Body() dto: CreatePipelineDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CreatePipelineCommand(dto, ctx));
  }

  @HasCapability(PIPELINESTAGE.create)
  @Post(':pipelineId/stages')
  addStage(
    @Param('pipelineId', ParseUUIDPipe) pipelineId: string,
    @Body() dto: AddPipelineStageDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AddPipelineStageCommand({ pipelineId, data: dto, ctx })
    );
  }

  @HasCapability(PIPELINESTAGE.update)
  @Put('stages/:stageId')
  updateStage(
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Body() dto: UpdatePipelineStageDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdatePipelineStageCommand({ stageId, data: dto, ctx })
    );
  }

  @HasCapability(PIPELINESTAGE.delete)
  @Delete('stages/:stageId')
  deleteStage(
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new DeletePipelineStageCommand(stageId, ctx)
    );
  }
}
