import { Module } from '@nestjs/common';
import { AccountingPeriodPresentationModule } from './presentation/presentation.module';

@Module({ imports: [AccountingPeriodPresentationModule] })
export class AccountingPeriodModule {}
