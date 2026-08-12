import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  AllocateProjectResourceDto,
  AssignProjectTaskDto,
  ChangeProjectStatusDto,
  CreateProjectDto,
  CreateProjectPhaseDto,
  CreateProjectTaskDto,
  MoveProjectTaskDto,
  RecordProjectCostDto,
  UpdateProjectDto,
  UpdateProjectPhaseDto,
  UpdateProjectTaskDto,
} from '@shared/modules/project/dto/commands';
import { CreateProjectCommand } from '@modules/organization/project/application/commands/create-project/create-project.command';
import { UpdateProjectCommand } from '@modules/organization/project/application/commands/update-project/update-project.command';
import { ChangeProjectStatusCommand } from '@modules/organization/project/application/commands/change-project-status/change-project-status.command';
import { CreateProjectPhaseCommand } from '@modules/organization/project/application/commands/create-project-phase/create-project-phase.command';
import { UpdateProjectPhaseCommand } from '@modules/organization/project/application/commands/update-project-phase/update-project-phase.command';
import { CreateProjectTaskCommand } from '@modules/organization/project/application/commands/create-project-task/create-project-task.command';
import { UpdateProjectTaskCommand } from '@modules/organization/project/application/commands/update-project-task/update-project-task.command';
import { MoveProjectTaskCommand } from '@modules/organization/project/application/commands/move-project-task/move-project-task.command';
import { AssignProjectTaskCommand } from '@modules/organization/project/application/commands/assign-project-task/assign-project-task.command';
import { RecordProjectCostCommand } from '@modules/organization/project/application/commands/record-project-cost/record-project-cost.command';
import { AllocateProjectResourceCommand } from '@modules/organization/project/application/commands/allocate-project-resource/allocate-project-resource.command';
import { ReleaseProjectResourceCommand } from '@modules/organization/project/application/commands/release-project-resource/release-project-resource.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const {
  PROJECT,
  PROJECTCOST,
  PROJECTPHASE,
  PROJECTRESOURCEALLOCATION,
  PROJECTTASK,
} = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class ProjectCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  // ---------- Proje ----------

  @HasCapability(PROJECT.create)
  @Post('projects')
  create(@Body() dto: CreateProjectDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(
      new CreateProjectCommand({ data: dto, ctx })
    );
  }

  @HasCapability(PROJECT.update)
  @Put('projects/:projectId')
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: UpdateProjectDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateProjectCommand({ projectId, data: dto, ctx })
    );
  }

  @HasCapability(PROJECT.update)
  @Patch('projects/:projectId/status')
  changeStatus(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: ChangeProjectStatusDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ChangeProjectStatusCommand({ projectId, data: dto, ctx })
    );
  }

  // ---------- Aşama ----------

  @HasCapability(PROJECTPHASE.create)
  @Post('projects/:projectId/phases')
  createPhase(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateProjectPhaseDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CreateProjectPhaseCommand({ projectId, data: dto, ctx })
    );
  }

  @HasCapability(PROJECTPHASE.update)
  @Put('phases/:phaseId')
  updatePhase(
    @Param('phaseId', ParseUUIDPipe) phaseId: string,
    @Body() dto: UpdateProjectPhaseDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateProjectPhaseCommand({ phaseId, data: dto, ctx })
    );
  }

  @HasCapability(PROJECTTASK.create)
  @Post('projects/:projectId/tasks')
  createTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateProjectTaskDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CreateProjectTaskCommand({ projectId, data: dto, ctx })
    );
  }

  @HasCapability(PROJECTTASK.update)
  @Put('tasks/:taskId')
  updateTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateProjectTaskDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateProjectTaskCommand({ taskId, data: dto, ctx })
    );
  }

  @HasCapability(PROJECTTASK.update)
  @Patch('tasks/:taskId/move')
  moveTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: MoveProjectTaskDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new MoveProjectTaskCommand({ taskId, data: dto, ctx })
    );
  }

  @HasCapability(PROJECTTASK.update)
  @Patch('tasks/:taskId/assignee')
  assignTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: AssignProjectTaskDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AssignProjectTaskCommand({ taskId, data: dto, ctx })
    );
  }

  // ---------- Bütçe / Maliyet ----------

  @HasCapability(PROJECTCOST.create)
  @Post('projects/:projectId/costs')
  recordCost(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: RecordProjectCostDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RecordProjectCostCommand({ projectId, data: dto, ctx })
    );
  }

  // ---------- Kaynak tahsisi ----------

  @HasCapability(PROJECTRESOURCEALLOCATION.create)
  @Post('projects/:projectId/allocations')
  allocate(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: AllocateProjectResourceDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AllocateProjectResourceCommand({ projectId, data: dto, ctx })
    );
  }

  @HasCapability(PROJECTRESOURCEALLOCATION.delete)
  @Delete('allocations/:allocationId')
  release(
    @Param('allocationId', ParseUUIDPipe) allocationId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ReleaseProjectResourceCommand(allocationId, ctx)
    );
  }
}
