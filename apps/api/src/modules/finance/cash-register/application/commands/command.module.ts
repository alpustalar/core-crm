import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCashRegisterHandler } from './create-cash-register/create-cash-register.handler';
import { ArchiveCashRegisterHandler } from './archive-cash-register/archive-cash-register.handler';
import { OpenCashSessionHandler } from './open-cash-session/open-cash-session.handler';
import { RecordCashMovementHandler } from './record-cash-movement/record-cash-movement.handler';
import { CloseCashSessionHandler } from './close-cash-session/close-cash-session.handler';
import { CashRegisterRepositoriesModule } from '@modules/finance/cash-register/infrastructure/persistence/prisma/repositories/repositories.module';

export const CASH_REGISTER_COMMAND_HANDLERS = [
  CreateCashRegisterHandler,
  ArchiveCashRegisterHandler,
  OpenCashSessionHandler,
  RecordCashMovementHandler,
  CloseCashSessionHandler,
];

@Module({
  imports: [CqrsModule, CashRegisterRepositoriesModule],
  providers: CASH_REGISTER_COMMAND_HANDLERS,
  exports: CASH_REGISTER_COMMAND_HANDLERS,
})
export class CashRegisterCommandModule {}
