import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteActivityCommand } from './complete-activity.command';
import {
  ACTIVITY_COMMAND_REPOSITORY,
  IActivityCommandRepository,
} from '@modules/crm/activity/domain/repositories/activity.repository';
import { ActivityNotFoundException } from '@modules/crm/activity/domain/exceptions/activity.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(CompleteActivityCommand)
export class CompleteActivityHandler
  implements ICommandHandler<CompleteActivityCommand, void>
{
  constructor(
    @Inject(ACTIVITY_COMMAND_REPOSITORY)
    private readonly activityCommandRepo: IActivityCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CompleteActivityCommand): Promise<void> {
    const { activityId, ctx } = command;

    await this.txManager.run(async () => {
      const activity = await this.activityCommandRepo.findById(activityId);
      if (!activity) throw new ActivityNotFoundException(activityId);

      const validateOptions = this.policyFactory
        .entity(ctx.actor, ctx.source)
        .policy.getValidateOptions();

      activity.rules(validateOptions).complete().orThrow();

      activity.complete();

      await this.activityCommandRepo.save(activity);
    });
  }
}
