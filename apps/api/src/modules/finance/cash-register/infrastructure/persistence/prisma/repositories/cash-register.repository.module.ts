import { Module } from '@nestjs/common';
import {
  CASH_REGISTER_COMMAND_REPOSITORY,
  CASH_REGISTER_QUERY_REPOSITORY,
} from '@modules/finance/cash-register/domain/repositories/cash-register.repository';
import {
  CASH_SESSION_COMMAND_REPOSITORY,
  CASH_SESSION_QUERY_REPOSITORY,
} from '@modules/finance/cash-register/domain/repositories/cash-session.repository';
import { CASH_MOVEMENT_COMMAND_REPOSITORY } from '@modules/finance/cash-register/domain/repositories/cash-movement.repository';
import { CashRegisterCommandRepository } from './cash-register.command.repository';
import { CashRegisterQueryRepository } from './cash-register.query.repository';
import { CashSessionCommandRepository } from './cash-session.command.repository';
import { CashSessionQueryRepository } from './cash-session.query.repository';
import { CashMovementCommandRepository } from './cash-movement.command.repository';

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
export class CashRegisterRepositoryModule {}
