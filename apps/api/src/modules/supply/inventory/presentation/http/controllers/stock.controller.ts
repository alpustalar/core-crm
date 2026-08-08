import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import {
  AdjustStockDto,
  ReceiveStockDto,
  RecordProductUsageDto,
} from '@shared/modules/inventory/dto/commands';
import { GetStockMovementsDto } from '@shared/modules/inventory/dto/queries';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ReceiveStockCommand } from '@modules/supply/inventory/application/commands/receive-stock/receive-stock.command';
import { AdjustStockCommand } from '@modules/supply/inventory/application/commands/adjust-stock/adjust-stock.command';
import { RecordProductUsageCommand } from '@modules/supply/inventory/application/commands/record-product-usage/record-product-usage.command';
import { GetProductStockQuery } from '@modules/supply/inventory/application/queries/get-product-stock/get-product-stock.query';
import { GetLowStockAlertsQuery } from '@modules/supply/inventory/application/queries/get-low-stock-alerts/get-low-stock-alerts.query';
import { GetStockMovementsQuery } from '@modules/supply/inventory/application/queries/get-stock-movements/get-stock-movements.query';

/**
 * Stok operasyonları klinik bağlamında yürür (clinic = source-of-truth):
 * mal kabul, sayım düzeltme, tüketim ve stok/hareket sorguları.
 */
@UseGuards(AuthGuard)
@Controller('clinics/:clinicId/stock')
export class StockController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('receive')
  receive(
    @Param('clinicId') clinicId: string,
    @Body() dto: ReceiveStockDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new ReceiveStockCommand(clinicId, dto, ctx));
  }

  @Post('adjust')
  adjust(
    @Param('clinicId') clinicId: string,
    @Body() dto: AdjustStockDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AdjustStockCommand({ data: dto, ctx, clinicId })
    );
  }

  @Post('usage')
  recordUsage(
    @Param('clinicId') clinicId: string,
    @Body() dto: RecordProductUsageDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RecordProductUsageCommand(clinicId, dto, ctx)
    );
  }

  @Get()
  productStock(
    @Param('clinicId') clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetProductStockQuery(clinicId, ctx));
  }

  @Get('low-alerts')
  lowStockAlerts(
    @Param('clinicId') clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetLowStockAlertsQuery(clinicId, ctx));
  }

  @Get('movements')
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
