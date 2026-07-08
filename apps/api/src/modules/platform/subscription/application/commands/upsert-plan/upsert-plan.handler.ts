import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpsertPlanCommand } from './upsert-plan.command';
import {
  IPlanCommandRepository,
  PLAN_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/plan.repository.interface';
import { Plan } from '@modules/platform/subscription/domain/entities/plan.entity';

@CommandHandler(UpsertPlanCommand)
export class UpsertPlanHandler
  implements ICommandHandler<UpsertPlanCommand, string>
{
  constructor(
    @Inject(PLAN_COMMAND_REPOSITORY)
    private readonly planCommandRepo: IPlanCommandRepository
  ) {}

  async execute(command: UpsertPlanCommand): Promise<string> {
    const plan = Plan.create({
      planId: command.planId,
      name: command.name,
      monthlyPrice: command.monthlyPrice,
      currency: command.currency,
    });
    const saved = await this.planCommandRepo.upsertByPlanId(plan);
    return saved.id.value;
  }
}
