import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import {
  AdjustStockDto,
  ReceiveStockDto,
  RecordProductUsageDto,
} from '@shared/modules/inventory/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ReceiveStockCommand } from '@modules/supply/inventory/application/commands/receive-stock/receive-stock.command';
import { AdjustStockCommand } from '@modules/supply/inventory/application/commands/adjust-stock/adjust-stock.command';
import { RecordProductUsageCommand } from '@modules/supply/inventory/application/commands/record-product-usage/record-product-usage.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

/**
 * Stok operasyonları klinik bağlamında yürür (clinic = source-of-truth):
 * mal kabul, sayım düzeltme, tüketim ve stok/hareket sorguları.
 */

const { STOCKMOVEMENT } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller('clinics/:clinicId/stock')
export class StockCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(STOCKMOVEMENT.create)
  @Post('receive')
  receive(
    @Param('clinicId') clinicId: string,
    @Body() dto: ReceiveStockDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new ReceiveStockCommand(clinicId, dto, ctx));
  }

  @HasCapability(STOCKMOVEMENT.create)
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

  @HasCapability(STOCKMOVEMENT.create)
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
}
