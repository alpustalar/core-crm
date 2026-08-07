import { Module } from '@nestjs/common';
import { AccountingPeriodPresentationModule } from './presentation/presentation.module';
import { AccountingPeriodApplicationModule } from '@modules/finance/accounting/periods/application/application.module';
import { AccountingPeriodInfrastructureModule } from '@modules/finance/accounting/periods/infrastructure/infrastructure.module';

@Module({
  imports: [
    AccountingPeriodApplicationModule,
    AccountingPeriodPresentationModule,
    AccountingPeriodInfrastructureModule,
  ],
})
export class AccountingPeriodModule {}
