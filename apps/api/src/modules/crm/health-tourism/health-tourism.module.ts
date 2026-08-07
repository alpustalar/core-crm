import { Module } from '@nestjs/common';
import { HealthTourismPresentationModule } from './presentation/health-tourism.presentation.module';

@Module({ imports: [HealthTourismPresentationModule] })
export class HealthTourismModule {}
