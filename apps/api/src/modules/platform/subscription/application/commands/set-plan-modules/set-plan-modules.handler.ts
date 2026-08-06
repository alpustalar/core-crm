import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SetPlanModulesCommand } from './set-plan-modules.command';
import {
  IPlanCommandRepository,
  PLAN_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/plan.repository.interface';
import { SubscriptionPlanNotFoundException } from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';

@CommandHandler(SetPlanModulesCommand)
export class SetPlanModulesHandler
  implements ICommandHandler<SetPlanModulesCommand, void>
{
  constructor(
    @Inject(PLAN_COMMAND_REPOSITORY)
    private readonly planCommandRepo: IPlanCommandRepository
  ) {}

  async execute(command: SetPlanModulesCommand): Promise<void> {
    const { payload } = command;
    // Değiştirilecek planın satırı → okuma command repo'dan.
    const plan = await this.planCommandRepo.findByPlanId(payload.planId);
    if (!plan) {
      throw new SubscriptionPlanNotFoundException(payload.planId);
    }
    await this.planCommandRepo.setModules(plan.id.value, payload.moduleIds);
  }
}
