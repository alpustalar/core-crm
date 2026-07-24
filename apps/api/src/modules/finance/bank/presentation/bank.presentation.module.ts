import { Module } from '@nestjs/common';
import { BankAccountController } from './controllers/bank-account.controller';
import { BankStatementController } from './controllers/bank-statement.controller';
import { BankCommandModule } from '@modules/finance/bank/application/commands/command.module';
import { BankQueryModule } from '@modules/finance/bank/application/queries/query.module';

@Module({
  imports: [BankCommandModule, BankQueryModule],
  controllers: [BankAccountController, BankStatementController],
})
export class BankPresentationModule {}
