import { Module } from '@nestjs/common';
import { CashRegisterController } from './controllers/cash-register.controller';
import { CashSessionController } from './controllers/cash-session.controller';

@Module({
  imports: [CashRegisterAppli],
  controllers: [CashRegisterController, CashSessionController],
})
export class CashRegisterPresentationModule {}
