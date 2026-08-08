import { Module } from '@nestjs/common';
import { ChartOfAccountsController } from '@modules/finance/accounting/chart-of-accounts/presentation/http/controllers/chart-of-accounts.controller';

@Module({ controllers: [ChartOfAccountsController] })
export class ChartOfAccountsPresentationModule {}
