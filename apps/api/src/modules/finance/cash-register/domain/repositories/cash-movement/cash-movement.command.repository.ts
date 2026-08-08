import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { CashMovement } from '@modules/finance/cash-register/domain/entities/cash-movement.entity';

export const CASH_MOVEMENT_COMMAND_REPOSITORY = Symbol(
  'ICashMovementCommandRepository'
);

export type ICashMovementCommandRepository =
  IBaseCommandRepository<CashMovement>;
