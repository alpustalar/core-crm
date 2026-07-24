import { Module } from '@nestjs/common';
import { HotelCommandModule } from './application/commands/command.module';
import { HotelQueryModule } from './application/queries/query.module';
import { HealthTourismQueueModule } from './infrastructure/queue/health-tourism-queue.module';
import { HotelAiToolsModule } from './application/ai-tools/hotel-ai-tools.module';

@Module({
  imports: [
    HotelCommandModule,
    HotelQueryModule,
    HealthTourismQueueModule,
    HotelAiToolsModule,
  ],
  exports: [HotelCommandModule, HotelQueryModule],
})
export class HotelModule {}
