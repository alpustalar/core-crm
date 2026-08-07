import { Module } from '@nestjs/common';
import { ChartOfAccountsController } from './controllers/chart-of-accounts.controller';
import { ChartOfAccountsApplicationModule } from '@modules/finance/accounting/chart-of-accounts/application/application.module';

@Module({
  imports: [ChartOfAccountsApplicationModule],
  controllers: [ChartOfAccountsController],
})
export class ChartOfAccountsPresentationModule {}
