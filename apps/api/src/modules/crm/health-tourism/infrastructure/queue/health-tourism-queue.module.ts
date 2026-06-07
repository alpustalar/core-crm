import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { HotelContentSyncProducer } from './producers/hotel-content-sync.producer';
import { HotelContentSyncProcessor } from './processors/hotel-content-sync.processor';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.HEALTH_TOURISM })],
  providers: [HotelContentSyncProducer, HotelContentSyncProcessor],
})
export class HealthTourismQueueModule {}
