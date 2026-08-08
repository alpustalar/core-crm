import { Module } from '@nestjs/common';
import { CASH_MOVEMENT_COMMAND_REPOSITORY } from '@modules/finance/cash-register/domain/repositories/cash-movement/cash-movement.command.repository';
import { CashRegisterCommandRepository } from './cash-register/cash-register.command.repository';
import { CashRegisterQueryRepository } from './cash-register/cash-register.query.repository';
import { CashSessionCommandRepository } from './cash-session/cash-session.command.repository';
import { CashSessionQueryRepository } from './cash-session/cash-session.query.repository';
import { CashMovementCommandRepository } from './cash-movement/cash-movement.command.repository';
import { CASH_REGISTER_COMMAND_REPOSITORY } from '@modules/finance/cash-register/domain/repositories/cash-register/cash-register.command.repository';
import { CASH_REGISTER_QUERY_REPOSITORY } from '@modules/finance/cash-register/domain/repositories/cash-register/cash-register.query.repository';
import { CASH_SESSION_QUERY_REPOSITORY } from '@modules/finance/cash-register/domain/repositories/cash-session/cash-session.query.repository';
import { CASH_SESSION_COMMAND_REPOSITORY } from '@modules/finance/cash-register/domain/repositories/cash-session/cash-session.command.repository';

@Module({
  providers: [
    {
      provide: CASH_REGISTER_COMMAND_REPOSITORY,
      useClass: CashRegisterCommandRepository,
    },
    {
      provide: CASH_REGISTER_QUERY_REPOSITORY,
      useClass: CashRegisterQueryRepository,
    },
    {
      provide: CASH_SESSION_COMMAND_REPOSITORY,
      useClass: CashSessionCommandRepository,
    },
    {
      provide: CASH_SESSION_QUERY_REPOSITORY,
      useClass: CashSessionQueryRepository,
    },
    {
      provide: CASH_MOVEMENT_COMMAND_REPOSITORY,
      useClass: CashMovementCommandRepository,
    },
  ],
  exports: [
    CASH_REGISTER_COMMAND_REPOSITORY,
    CASH_REGISTER_QUERY_REPOSITORY,
    CASH_SESSION_COMMAND_REPOSITORY,
    CASH_SESSION_QUERY_REPOSITORY,
    CASH_MOVEMENT_COMMAND_REPOSITORY,
  ],
})
export class CashRegisterRepositoriesModule {}
