import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OUTBOX_JOBS, QUEUES } from '@common/constants';
import { OutboxProcessor } from './outbox.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.OUTBOX })],
  providers: [OutboxProcessor],
})
export class OutboxModule implements OnModuleInit {
  constructor(@InjectQueue(QUEUES.OUTBOX) private readonly outboxQueue: Queue) {}

  async onModuleInit() {
    await this.outboxQueue.add(OUTBOX_JOBS.PROCESS, {}, {
      repeat: { every: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
