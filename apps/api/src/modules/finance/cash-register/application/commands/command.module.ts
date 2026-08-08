import { Module } from '@nestjs/common';
import { CreateCashRegisterHandler } from './create-cash-register/create-cash-register.handler';
import { ArchiveCashRegisterHandler } from './archive-cash-register/archive-cash-register.handler';
import { OpenCashSessionHandler } from './open-cash-session/open-cash-session.handler';
import { RecordCashMovementHandler } from './record-cash-movement/record-cash-movement.handler';
import { CloseCashSessionHandler } from './close-cash-session/close-cash-session.handler';
import { CashRegisterInfrastructureModule } from '@modules/finance/cash-register/infrastructure/infrastructure.module';

export const CASH_REGISTER_COMMAND_HANDLERS = [
  CreateCashRegisterHandler,
  ArchiveCashRegisterHandler,
  OpenCashSessionHandler,
  RecordCashMovementHandler,
  CloseCashSessionHandler,
];

@Module({
  imports: [CashRegisterInfrastructureModule],
  providers: CASH_REGISTER_COMMAND_HANDLERS,
  exports: CASH_REGISTER_COMMAND_HANDLERS,
})
export class CashRegisterCommandModule {}
