import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { CreateModuleCommand } from '@modules/platform/subscription/application/commands/create-module/create-module.command';
import { UpdateModuleCommand } from '@modules/platform/subscription/application/commands/update-module/update-module.command';
import { UpsertPlanCommand } from '@modules/platform/subscription/application/commands/upsert-plan/upsert-plan.command';
import { SetPlanModulesCommand } from '@modules/platform/subscription/application/commands/set-plan-modules/set-plan-modules.command';
import {
  CreateModuleDto,
  SetPlanModulesDto,
  UpdateModuleDto,
  UpsertPlanDto,
} from '@shared/modules/subscription/dto/commands';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { MODULE, PLAN, PLANMODULE } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('subscription-admin')
export class SubscriptionAdminCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(MODULE.create)
  @Post('modules')
  createModule(@GetContext() ctx: IGetContext, @Body() dto: CreateModuleDto) {
    return this.commandBus.execute(new CreateModuleCommand({ ...dto, ctx }));
  }

  @HasCapability(MODULE.update)
  @Patch('modules/:id')
  updateModule(
    @GetContext() ctx: IGetContext,
    @Param('id') moduleId: string,
    @Body() dto: UpdateModuleDto
  ) {
    return this.commandBus.execute(
      new UpdateModuleCommand({ moduleId, ...dto, actor: ctx.actor })
    );
  }

  @HasCapability(PLAN.create)
  @Post('plans')
  upsertPlan(@GetContext() ctx: IGetContext, @Body() dto: UpsertPlanDto) {
    return this.commandBus.execute(
      new UpsertPlanCommand({ ...dto, actor: ctx.actor })
    );
  }

  @HasCapability(PLANMODULE.create)
  @Post('plans/:planId/modules')
  setPlanModules(
    @GetContext() ctx: IGetContext,
    @Param('planId') planId: PlanId,
    @Body() dto: SetPlanModulesDto
  ) {
    return this.commandBus.execute(
      new SetPlanModulesCommand({
        planId,
        moduleIds: dto.moduleIds,
        actor: ctx.actor,
      })
    );
  }
}
