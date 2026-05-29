import { Module } from '@nestjs/common';
import {
  STOCK_MOVEMENT_COMMAND_REPOSITORY,
  STOCK_MOVEMENT_QUERY_REPOSITORY,
} from '@modules/inventory/domain/repositories/stock-movement.repository.interface';
import { StockMovementCommandRepository } from './stock-movement.command.repository';
import { StockMovementQueryRepository } from './stock-movement.query.repository';

@Module({
  providers: [
    { provide: STOCK_MOVEMENT_COMMAND_REPOSITORY, useClass: StockMovementCommandRepository },
    { provide: STOCK_MOVEMENT_QUERY_REPOSITORY, useClass: StockMovementQueryRepository },
  ],
  exports: [STOCK_MOVEMENT_COMMAND_REPOSITORY, STOCK_MOVEMENT_QUERY_REPOSITORY],
})
export class StockMovementRepositoryModule {}
