import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ResumeSubscriptionCommand } from './resume-subscription.command';
import {
  ISubscriptionCommandRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { SubscriptionNotFoundException } from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

@CommandHandler(ResumeSubscriptionCommand)
export class ResumeSubscriptionHandler implements ICommandHandler<
  ResumeSubscriptionCommand,
  void
> {
  constructor(
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ResumeSubscriptionCommand): Promise<void> {
    const subscription = await this.subscriptionCommandRepo.findById(
      command.subscriptionId
    );
    if (!subscription) throw new SubscriptionNotFoundException();

    await this.txManager.run(async () => {
      subscription.undoCancellation();
      await this.subscriptionCommandRepo.update(subscription);
    });
  }
}
