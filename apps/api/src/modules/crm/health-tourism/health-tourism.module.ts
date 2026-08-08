import { Module } from '@nestjs/common';
import { HealthTourismPresentationModule } from './presentation/presentation.module';

@Module({ imports: [HealthTourismPresentationModule] })
export class HealthTourismModule {}
