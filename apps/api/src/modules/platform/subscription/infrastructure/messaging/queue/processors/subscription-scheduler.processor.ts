import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, SUBSCRIPTION_JOBS } from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ProcessSubscriptionRenewalsCommand } from '@modules/platform/subscription/application/commands/process-subscription-renewals/process-subscription-renewals.command';
import { ExpirePastDueSubscriptionsCommand } from '@modules/platform/subscription/application/commands/expire-past-due-subscriptions/expire-past-due-subscriptions.command';
import { ExpireTrialsCommand } from '@modules/platform/subscription/application/commands/expire-trials/expire-trials.command';

@Processor(QUEUES.SUBSCRIPTION)
export class SubscriptionSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(SubscriptionSchedulerProcessor.name);

  constructor(private readonly commandBus: TSCommandBus) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case SUBSCRIPTION_JOBS.RENEW_DUE:
        await this.commandBus.execute(new ProcessSubscriptionRenewalsCommand());
        break;
      case SUBSCRIPTION_JOBS.EXPIRE_PAST_DUE:
        await this.commandBus.execute(new ExpirePastDueSubscriptionsCommand());
        break;
      case SUBSCRIPTION_JOBS.EXPIRE_TRIALS:
        await this.commandBus.execute(new ExpireTrialsCommand());
        break;
      default:
        this.logger.warn(`Tanımlanmamış abonelik job: ${job.name}`);
    }
  }
}
