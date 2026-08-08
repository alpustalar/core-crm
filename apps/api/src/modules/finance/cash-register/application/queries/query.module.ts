import { Module } from '@nestjs/common';
import { CashRegisterRepositoriesModule } from '@modules/finance/cash-register/infrastructure/persistence/prisma/repositories/repositories.module';
import { GetCashRegistersHandler } from './get-cash-registers/get-cash-registers.handler';
import { GetCashRegisterByIdHandler } from './get-cash-register-by-id/get-cash-register-by-id.handler';
import { GetCashSessionsHandler } from './get-cash-sessions/get-cash-sessions.handler';
import { GetCashSessionByIdHandler } from './get-cash-session-by-id/get-cash-session-by-id.handler';
import { GetOpenCashSessionHandler } from './get-open-cash-session/get-open-cash-session.handler';

export const CASH_REGISTER_QUERY_HANDLERS = [
  GetCashRegistersHandler,
  GetCashRegisterByIdHandler,
  GetCashSessionsHandler,
  GetCashSessionByIdHandler,
  GetOpenCashSessionHandler,
];

@Module({
  imports: [CashRegisterRepositoriesModule],
  providers: CASH_REGISTER_QUERY_HANDLERS,
  exports: CASH_REGISTER_QUERY_HANDLERS,
})
export class CashRegisterQueryModule {}
