import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteActivityCommand } from './delete-activity.command';
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
import { ACTIVITY_EVENTS } from '@src/domain/constants/events';

@CommandHandler(DeleteActivityCommand)
export class DeleteActivityHandler
  implements ICommandHandler<DeleteActivityCommand, void>
{
  constructor(
    @Inject(ACTIVITY_COMMAND_REPOSITORY)
    private readonly activityCommandRepo: IActivityCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: DeleteActivityCommand): Promise<void> {
    const { activityId, ctx } = command;

    await this.txManager.run(async () => {
      const activity = await this.activityCommandRepo.findById(activityId);

      if (!activity) throw new ActivityNotFoundException(activityId);

      this.policyFactory
        .clinic(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.actorCanManageTargetClinic(activity.clinicId.value)
        )
        .orThrow(ACTIVITY_EVENTS.DELETED);

      await this.activityCommandRepo.deleteById(activityId);
    });
  }
}
