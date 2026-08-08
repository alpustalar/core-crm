import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
  CreateActivityDto,
  UpdateActivityDto,
} from '@shared/modules/activity/dto/commands';
import { GetMyTasksDto } from '@shared/modules/activity/dto/queries';
import { CreateActivityCommand } from '@modules/crm/activity/application/commands/create-activity/create-activity.command';
import { UpdateActivityCommand } from '@modules/crm/activity/application/commands/update-activity/update-activity.command';
import { CompleteActivityCommand } from '@modules/crm/activity/application/commands/complete-activity/complete-activity.command';
import { DeleteActivityCommand } from '@modules/crm/activity/application/commands/delete-activity/delete-activity.command';
import { GetActivitiesByLeadQuery } from '@modules/crm/activity/application/queries/get-activities-by-lead/get-activities-by-lead.query';
import { GetMyTasksQuery } from '@modules/crm/activity/application/queries/get-my-tasks/get-my-tasks.query';

@UseGuards(AuthGuard)
@Controller()
export class ActivityController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(@Body() dto: CreateActivityDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateActivityCommand(dto, ctx));
  }

  @Get('my-tasks')
  getMyTasks(
    @Query() dto: GetMyTasksDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetMyTasksQuery({ data: dto, pagination, ctx })
    );
  }

  @Get('lead/:leadId')
  getByLead(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetActivitiesByLeadQuery({ leadId, pagination, ctx })
    );
  }

  @Put(':activityId')
  update(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @Body() dto: UpdateActivityDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateActivityCommand({ activityId, data: dto, ctx })
    );
  }

  @Put(':activityId/complete')
  complete(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CompleteActivityCommand(activityId, ctx)
    );
  }

  @Delete(':activityId')
  remove(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new DeleteActivityCommand(activityId, ctx));
  }
}
