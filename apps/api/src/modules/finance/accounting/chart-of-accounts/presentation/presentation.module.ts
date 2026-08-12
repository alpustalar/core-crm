import { Module } from '@nestjs/common';
import { ChartOfAccountsCommandController } from '@modules/finance/accounting/chart-of-accounts/presentation/http/controllers/chart-of-accounts.command.controller';

@Module({ controllers: [ChartOfAccountsCommandController] })
export class ChartOfAccountsPresentationModule {}
