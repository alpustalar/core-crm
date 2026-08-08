import { Module } from '@nestjs/common';
import { CashRegisterController } from '@modules/finance/cash-register/presentation/http/controllers/cash-register.controller';
import { CashSessionController } from '@modules/finance/cash-register/presentation/http/controllers/cash-session.controller';

@Module({ controllers: [CashRegisterController, CashSessionController] })
export class CashRegisterPresentationModule {}
