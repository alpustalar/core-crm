import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ExpireTrialsCommand } from './expire-trials.command';
import {
  ISubscriptionCommandRepository,
  ISubscriptionQueryRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

@CommandHandler(ExpireTrialsCommand)
export class ExpireTrialsHandler implements ICommandHandler<
  ExpireTrialsCommand,
  void
> {
  private readonly logger = new Logger(ExpireTrialsHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(): Promise<void> {
    const trials = await this.subscriptionQueryRepo.findExpiredTrials(
      DateTimeManager.create()
    );
    if (trials.length === 0) return;

    this.logger.log(`Deneme bitişi: ${trials.length} abonelik kilitleniyor`);

    for (const subscription of trials) {
      await this.txManager
        .run(async () => {
          subscription.expire();
          await this.subscriptionCommandRepo.update(subscription);
        })
        .catch((err) =>
          this.logger.error(
            `Deneme bitirme hatası (subscriptionId: ${subscription.id.value})`,
            err
          )
        );
    }
  }
}
