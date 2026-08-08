import { Module } from '@nestjs/common';
import { BankAccountController } from './controllers/bank-account.controller';
import { BankStatementController } from './controllers/bank-statement.controller';
import { BankApplicationModule } from '@modules/finance/bank/application/application.module';

@Module({
  imports: [BankApplicationModule],
  controllers: [BankAccountController, BankStatementController],
})
export class BankPresentationModule {}
