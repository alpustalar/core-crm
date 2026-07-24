import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { CreateModuleCommand } from '@modules/platform/subscription/application/commands/create-module/create-module.command';
import { UpdateModuleCommand } from '@modules/platform/subscription/application/commands/update-module/update-module.command';
import { UpsertPlanCommand } from '@modules/platform/subscription/application/commands/upsert-plan/upsert-plan.command';
import { SetPlanModulesCommand } from '@modules/platform/subscription/application/commands/set-plan-modules/set-plan-modules.command';
import { ListModulesQuery } from '@modules/platform/subscription/application/queries/list-modules/list-modules.query';
import { ListPlansQuery } from '@modules/platform/subscription/application/queries/list-plans/list-plans.query';

/**
 * Platform admin katalog yönetimi — eklenti modülleri + planlar (fiyat + bundle).
 * PlanId sabittir (yeni plan eklenmez); admin plan fiyatını/modüllerini düzenler.
 */
@UseGuards(AuthGuard)
@Controller('subscription-admin')
export class SubscriptionAdminController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Get('modules')
  listModules() {
    return this.queryBus.execute(new ListModulesQuery());
  }

  // TODO: DTO oluşturulacak
  @Post('modules')
  createModule(
    @GetContext() ctx: IGetContext,
    @Body()
    body: {
      key: string;
      name: string;
      monthlyPrice: number;
      currency: CurrencyType;
      description?: string | null;
    }
  ) {
    return this.commandBus.execute(new CreateModuleCommand({ ...body, ctx }));
  }

  @Patch('modules/:id')
  updateModule(
    @GetContext() ctx: IGetContext,
    @Param('id') moduleId: string,
    @Body()
    body: {
      monthlyPrice?: number;
      currency?: CurrencyType;
      isActive?: boolean;
    }
  ) {
    return this.commandBus.execute(
      new UpdateModuleCommand({ moduleId, ...body, actor: ctx.actor })
    );
  }

  @Get('plans')
  listPlans() {
    return this.queryBus.execute(new ListPlansQuery());
  }

  @Post('plans')
  upsertPlan(
    @GetContext() ctx: IGetContext,
    @Body()
    body: {
      planId: PlanId;
      name: string;
      monthlyPrice: number;
      currency: CurrencyType;
    }
  ) {
    return this.commandBus.execute(
      new UpsertPlanCommand({ ...body, actor: ctx.actor })
    );
  }

  @Post('plans/:planId/modules')
  setPlanModules(
    @GetContext() ctx: IGetContext,
    @Param('planId') planId: PlanId,
    @Body('moduleIds') moduleIds: string[]
  ) {
    return this.commandBus.execute(
      new SetPlanModulesCommand({ planId, moduleIds, actor: ctx.actor })
    );
  }
}
