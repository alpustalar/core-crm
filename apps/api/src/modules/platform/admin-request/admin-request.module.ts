import { Module } from '@nestjs/common';
import { AdminRequestPresentationModule } from './presentation/presentation.module';

@Module({ imports: [AdminRequestPresentationModule] })
export class AdminRequestModule {}
