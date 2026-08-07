import { Module } from '@nestjs/common';
import { AccountingPeriodController } from './controllers/accounting-period.controller';
import { AccountingPeriodApplicationModule } from '@modules/finance/accounting/periods/application/application.module';

@Module({
  imports: [AccountingPeriodApplicationModule],
  controllers: [AccountingPeriodController],
})
export class AccountingPeriodPresentationModule {}
