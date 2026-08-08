import { Module } from '@nestjs/common';
import { AccountingPeriodController } from '@modules/finance/accounting/periods/presentation/http/controllers/accounting-period.controller';

@Module({ controllers: [AccountingPeriodController] })
export class AccountingPeriodPresentationModule {}
