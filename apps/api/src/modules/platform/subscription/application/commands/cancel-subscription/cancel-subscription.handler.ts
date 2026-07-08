import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CancelSubscriptionCommand } from './cancel-subscription.command';
import {
  ISubscriptionCommandRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { SubscriptionNotFoundException } from '@modules/platform/subscription/domain/exceptions/subscription.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler
  implements ICommandHandler<CancelSubscriptionCommand, void>
{
  constructor(
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CancelSubscriptionCommand): Promise<void> {
    const subscription = await this.subscriptionCommandRepo.findById(
      command.subscriptionId
    );
    if (!subscription) throw new SubscriptionNotFoundException();

    await this.txManager.run(async () => {
      if (command.immediate) {
        subscription.cancel(); // anında CANCELED
      } else {
        subscription.scheduleCancellation(); // dönem sonunda iptal
      }
      await this.subscriptionCommandRepo.save(subscription);
    });
  }
}
