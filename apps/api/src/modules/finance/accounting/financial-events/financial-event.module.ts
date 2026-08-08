import { Module } from '@nestjs/common';
import { FinancialEventPresentationModule } from './presentation/presentation.module';

@Module({ imports: [FinancialEventPresentationModule] })
export class FinancialEventModule {}
