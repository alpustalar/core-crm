import { Module } from '@nestjs/common';
import { BankAccountController } from '@modules/finance/bank/presentation/http/controllers/bank-account.controller';
import { BankStatementController } from '@modules/finance/bank/presentation/http/controllers/bank-statement.controller';

@Module({ controllers: [BankAccountController, BankStatementController] })
export class BankPresentationModule {}
