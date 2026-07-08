import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ExpirePastDueSubscriptionsCommand } from './expire-past-due-subscriptions.command';
import {
  ISubscriptionCommandRepository,
  ISubscriptionQueryRepository,
  SUBSCRIPTION_COMMAND_REPOSITORY,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { DateTimeManager } from '@common/utils';
import { SUBSCRIPTION_GRACE_DAYS } from '@common/constants';

@CommandHandler(ExpirePastDueSubscriptionsCommand)
export class ExpirePastDueSubscriptionsHandler
  implements ICommandHandler<ExpirePastDueSubscriptionsCommand, void>
{
  private readonly logger = new Logger(ExpirePastDueSubscriptionsHandler.name);

  constructor(
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly subscriptionCommandRepo: ISubscriptionCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(): Promise<void> {
    const pastDue = await this.subscriptionQueryRepo.findPastDue();
    const now = new Date();

    for (const subscription of pastDue) {
      const periodEnd = subscription.currentPeriodEnd;
      // Grace: dönem bitişi + SUBSCRIPTION_GRACE_DAYS gün geçtiyse süresi biter.
      const graceOver = periodEnd
        ? DateTimeManager.isBefore(
            DateTimeManager.addDays(periodEnd, SUBSCRIPTION_GRACE_DAYS),
            now
          )
        : true; // dönem bilgisi yoksa güvenli tarafta süreyi bitir
      if (!graceOver) continue;

      await this.txManager
        .run(async () => {
          subscription.expire();
          await this.subscriptionCommandRepo.save(subscription);
        })
        .catch((err) =>
          this.logger.error(
            `Süre bitirme hatası (subscriptionId: ${subscription.id.value})`,
            err
          )
        );
    }
  }
}
