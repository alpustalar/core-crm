import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { POS_JOBS, QUEUES } from '@common/constants';
import { ReconcilePosTransactionsCommand } from '@modules/pos/application/commands/reconcile-pos-transactions/reconcile-pos-transactions.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Processor(QUEUES.POS)
export class PosReconcileProcessor extends WorkerHost {
  private readonly logger = new Logger(PosReconcileProcessor.name);

  constructor(private readonly commandBus: TSCommandBus) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case POS_JOBS.RECONCILE_PENDING:
        await this.handleReconcile();
        break;
      default:
        this.logger.warn(`Tanımlanmamış POS job: ${job.name}`);
    }
  }

  private async handleReconcile(): Promise<void> {
    this.logger.log('POS reconcile job tetiklendi');
    try {
      await this.commandBus.execute(new ReconcilePosTransactionsCommand());
    } catch (err) {
      this.logger.error('POS reconcile job hatası', err);
      throw err;
    }
  }
}
