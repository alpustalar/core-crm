import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SetPlanModulesCommand } from './set-plan-modules.command';
import {
  IPlanCommandRepository,
  IPlanQueryRepository,
  PLAN_COMMAND_REPOSITORY,
  PLAN_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/plan.repository.interface';
import { SubscriptionPlanNotFoundException } from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';

@CommandHandler(SetPlanModulesCommand)
export class SetPlanModulesHandler
  implements ICommandHandler<SetPlanModulesCommand, void>
{
  constructor(
    @Inject(PLAN_QUERY_REPOSITORY)
    private readonly planQueryRepo: IPlanQueryRepository,
    @Inject(PLAN_COMMAND_REPOSITORY)
    private readonly planCommandRepo: IPlanCommandRepository
  ) {}

  async execute(command: SetPlanModulesCommand): Promise<void> {
    const plan = await this.planQueryRepo.findByPlanId(command.planId);
    if (!plan) {
      throw new SubscriptionPlanNotFoundException(command.planId);
    }
    await this.planCommandRepo.setModules(plan.id.value, command.moduleIds);
  }
}
