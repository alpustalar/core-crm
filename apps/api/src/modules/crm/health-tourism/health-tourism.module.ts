import { Module } from '@nestjs/common';
import { HealthTourismPresentationModule } from './presentation/health-tourism.presentation.module';
import { HealthTourismQueueModule } from './infrastructure/queue/health-tourism-queue.module';

@Module({
  imports: [HealthTourismPresentationModule, HealthTourismQueueModule],
})
export class HealthTourismModule {}
