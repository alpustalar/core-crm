import { Module } from '@nestjs/common';
import { CashRegisterController } from './controllers/cash-register.controller';
import { CashSessionController } from './controllers/cash-session.controller';
import { CashRegisterCommandModule } from '@modules/finance/cash-register/application/commands/command.module';
import { CashRegisterQueryModule } from '@modules/finance/cash-register/application/queries/query.module';

@Module({
  imports: [CashRegisterCommandModule, CashRegisterQueryModule],
  controllers: [CashRegisterController, CashSessionController],
})
export class CashRegisterPresentationModule {}
