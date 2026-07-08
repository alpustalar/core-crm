import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { SubscriptionSchedulerProducer } from './producers/subscription-scheduler.producer';
import { SubscriptionSchedulerProcessor } from './processors/subscription-scheduler.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.SUBSCRIPTION })],
  providers: [SubscriptionSchedulerProducer, SubscriptionSchedulerProcessor],
})
export class SubscriptionQueueModule {}
