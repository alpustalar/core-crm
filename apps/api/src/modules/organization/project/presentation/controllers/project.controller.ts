import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
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
import {
  GetMyProjectTasksFilterDto,
  GetProjectTasksFilterDto,
  GetProjectsFilterDto,
  GetResourceScheduleFilterDto,
} from '@shared/modules/project/dto/queries';
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
import { GetProjectsQuery } from '@modules/organization/project/application/queries/get-projects/get-projects.query';
import { GetProjectByIdQuery } from '@modules/organization/project/application/queries/get-project-by-id/get-project-by-id.query';
import { GetProjectBoardQuery } from '@modules/organization/project/application/queries/get-project-board/get-project-board.query';
import { GetMyProjectTasksQuery } from '@modules/organization/project/application/queries/get-my-project-tasks/get-my-project-tasks.query';
import { GetProjectBudgetVsActualQuery } from '@modules/organization/project/application/queries/get-project-budget-vs-actual/get-project-budget-vs-actual.query';
import { GetResourceScheduleQuery } from '@modules/organization/project/application/queries/get-resource-schedule/get-resource-schedule.query';

@UseGuards(AuthGuard)
@Controller()
export class ProjectController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  // ---------- Proje ----------

  @Post('projects')
  create(@Body() dto: CreateProjectDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(
      new CreateProjectCommand({ data: dto, ctx })
    );
  }

  @Get('projects')
  list(
    @Query() dto: GetProjectsFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetProjectsQuery({ filter: dto, pagination, ctx })
    );
  }

  /** Kendi görev listem — proje kırılımı olmadan, klinik geneli. */
  @Get('my-tasks')
  myTasks(
    @Query() dto: GetMyProjectTasksFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetMyProjectTasksQuery({ filter: dto, pagination, ctx })
    );
  }

  /** Kaynak takvimi — tahsis öncesi "kim müsait" görünümü. */
  @Get('resources/schedule')
  resourceSchedule(
    @Query() dto: GetResourceScheduleFilterDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetResourceScheduleQuery({ filter: dto, ctx })
    );
  }

  @Get('projects/:projectId')
  getById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetProjectByIdQuery(projectId, ctx));
  }

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

  // ---------- Görev ----------

  @Get('projects/:projectId/board')
  board(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() dto: GetProjectTasksFilterDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetProjectBoardQuery({ projectId, filter: dto, ctx })
    );
  }

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

  @Get('projects/:projectId/budget')
  budgetVsActual(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetProjectBudgetVsActualQuery(projectId, ctx)
    );
  }

  // ---------- Kaynak tahsisi ----------

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
