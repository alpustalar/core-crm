import { Module } from '@nestjs/common';
import { CashRegisterPresentationModule } from './presentation/cash-register.presentation.module';
import { CashRegisterCommandModule } from './application/commands/command.module';
import { CashRegisterQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    CashRegisterPresentationModule,
    CashRegisterCommandModule,
    CashRegisterQueryModule,
  ],
  exports: [CashRegisterCommandModule, CashRegisterQueryModule],
})
export class CashRegisterModule {}
