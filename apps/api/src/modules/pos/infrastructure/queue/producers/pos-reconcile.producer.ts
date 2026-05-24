import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { POS_JOBS, QUEUES } from '@common/constants';

@Injectable()
export class PosReconcileProducer implements OnModuleInit {
  private readonly logger = new Logger(PosReconcileProducer.name);

  constructor(
    @InjectQueue(QUEUES.POS) private readonly posQueue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    await this.posQueue.add(
      POS_JOBS.RECONCILE_PENDING,
      {},
      {
        repeat: { pattern: '*/5 * * * *' }, // her 5 dakikada bir
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
    this.logger.log('POS reconcile periyodik iş zamanlandı (her 5 dk)');
  }
}
