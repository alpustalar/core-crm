import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  AddPipelineStageDto,
  CreatePipelineDto,
  UpdatePipelineStageDto,
} from '@shared/modules/pipeline/dto/commands';
import { CreatePipelineCommand } from '@modules/crm/pipeline/application/commands/create-pipeline/create-pipeline.command';
import { AddPipelineStageCommand } from '@modules/crm/pipeline/application/commands/add-pipeline-stage/add-pipeline-stage.command';
import { UpdatePipelineStageCommand } from '@modules/crm/pipeline/application/commands/update-pipeline-stage/update-pipeline-stage.command';
import { DeletePipelineStageCommand } from '@modules/crm/pipeline/application/commands/delete-pipeline-stage/delete-pipeline-stage.command';
import { GetPipelinesQuery } from '@modules/crm/pipeline/application/queries/get-pipelines/get-pipelines.query';
import { GetPipelineByIdQuery } from '@modules/crm/pipeline/application/queries/get-pipeline-by-id/get-pipeline-by-id.query';

@UseGuards(AuthGuard)
@Controller()
export class PipelineController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  // Route'lar 'pipelines' prefix'i altında (APP_ROUTES). Metod path'leri relative.
  @Post()
  createPipeline(
    @Body() dto: CreatePipelineDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CreatePipelineCommand(dto, ctx));
  }

  @Get()
  getPipelines(@GetContext() ctx: IGetContext) {
    return this.queryBus.execute(new GetPipelinesQuery(ctx));
  }

  @Get(':pipelineId')
  getPipelineById(
    @Param('pipelineId', ParseUUIDPipe) pipelineId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetPipelineByIdQuery(pipelineId, ctx));
  }

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
