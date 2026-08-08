import { Module } from '@nestjs/common';
import { StockMovementCommandRepository } from './stock-movement.command.repository';
import { StockMovementQueryRepository } from './stock-movement.query.repository';
import { STOCK_MOVEMENT_COMMAND_REPOSITORY } from '@modules/supply/inventory/domain/repositories/stock-movement/stock-movement.command.repository';
import { STOCK_MOVEMENT_QUERY_REPOSITORY } from '@modules/supply/inventory/domain/repositories/stock-movement/stock-movement.query.repository';

@Module({
  providers: [
    {
      provide: STOCK_MOVEMENT_COMMAND_REPOSITORY,
      useClass: StockMovementCommandRepository,
    },
    {
      provide: STOCK_MOVEMENT_QUERY_REPOSITORY,
      useClass: StockMovementQueryRepository,
    },
  ],
  exports: [STOCK_MOVEMENT_COMMAND_REPOSITORY, STOCK_MOVEMENT_QUERY_REPOSITORY],
})
export class StockMovementRepositoryModule {}
