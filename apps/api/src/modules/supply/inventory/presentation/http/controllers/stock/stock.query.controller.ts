import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { Serialize } from '@common/decorators/serialize.decorator';
import { PaginationDto, StockMovement } from '@shared';
import {
  StockLevelResponseDto,
  StockMovementResponseDto,
} from '@modules/supply/inventory/presentation/http/dto';
import { StockLevel } from '@modules/supply/inventory/domain/contracts/stock-movement.contracts';
import { GetStockMovementsDto } from '@shared/modules/inventory/dto/queries';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetProductStockQuery } from '@modules/supply/inventory/application/queries/get-product-stock/get-product-stock.query';
import { GetLowStockAlertsQuery } from '@modules/supply/inventory/application/queries/get-low-stock-alerts/get-low-stock-alerts.query';
import { GetStockMovementsQuery } from '@modules/supply/inventory/application/queries/get-stock-movements/get-stock-movements.query';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

/**
 * Stok operasyonları klinik bağlamında yürür (clinic = source-of-truth):
 * mal kabul, sayım düzeltme, tüketim ve stok/hareket sorguları.
 */

const { STOCKMOVEMENT } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller('clinics/:clinicId/stock')
export class StockQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}

  @HasCapability(STOCKMOVEMENT.read)
  @Get()
  @Serialize<StockLevel, StockLevelResponseDto>(StockLevelResponseDto)
  productStock(
    @Param('clinicId') clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetProductStockQuery(clinicId, ctx));
  }

  @HasCapability(STOCKMOVEMENT.read)
  @Get('low-alerts')
  @Serialize<StockLevel, StockLevelResponseDto>(StockLevelResponseDto)
  lowStockAlerts(
    @Param('clinicId') clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetLowStockAlertsQuery(clinicId, ctx));
  }

  @HasCapability(STOCKMOVEMENT.read)
  @Get('movements')
  @Serialize<StockMovement, StockMovementResponseDto>(StockMovementResponseDto)
  movements(
    @Param('clinicId') clinicId: string,
    @Query() dto: GetStockMovementsDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetStockMovementsQuery({ clinicId, data: dto, pagination, ctx })
    );
  }
}
