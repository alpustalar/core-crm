import { Module } from '@nestjs/common';
import { HotelCommandModule } from './application/commands/command.module';
import { HotelQueryModule } from './application/queries/query.module';
import { HealthTourismQueueModule } from './infrastructure/queue/health-tourism-queue.module';

@Module({
  imports: [HotelCommandModule, HotelQueryModule, HealthTourismQueueModule],
  exports: [HotelCommandModule, HotelQueryModule],
})
export class HotelModule {}
