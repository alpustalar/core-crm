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
  CreateActivityDto,
  UpdateActivityDto,
} from '@shared/modules/activity/dto/commands';
import { CreateActivityCommand } from '@modules/crm/activity/application/commands/create-activity/create-activity.command';
import { UpdateActivityCommand } from '@modules/crm/activity/application/commands/update-activity/update-activity.command';
import { CompleteActivityCommand } from '@modules/crm/activity/application/commands/complete-activity/complete-activity.command';
import { DeleteActivityCommand } from '@modules/crm/activity/application/commands/delete-activity/delete-activity.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { ACTIVITY } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class ActivityCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(ACTIVITY.create)
  @Post()
  create(@Body() dto: CreateActivityDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateActivityCommand(dto, ctx));
  }

  @HasCapability(ACTIVITY.update)
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

  @HasCapability(ACTIVITY.update)
  @Put(':activityId/complete')
  complete(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CompleteActivityCommand(activityId, ctx)
    );
  }

  @HasCapability(ACTIVITY.delete)
  @Delete(':activityId')
  remove(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new DeleteActivityCommand(activityId, ctx));
  }
}
