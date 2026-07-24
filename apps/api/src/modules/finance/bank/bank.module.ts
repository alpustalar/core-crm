import { Module } from '@nestjs/common';
import { BankPresentationModule } from './presentation/bank.presentation.module';
import { BankCommandModule } from './application/commands/command.module';
import { BankQueryModule } from './application/queries/query.module';

@Module({
  imports: [BankPresentationModule, BankCommandModule, BankQueryModule],
  exports: [BankCommandModule, BankQueryModule],
})
export class BankModule {}
