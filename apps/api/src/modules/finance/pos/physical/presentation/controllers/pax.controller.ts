import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import {
  PaxBatchCloseDto,
  PaxRefundDto,
  PaxSaleDto,
  PaxVoidDto,
} from '@shared/modules/pos/dto/commands';
import { PaxSaleCommand } from '@modules/finance/pos/physical/application/commands/pax-sale/pax-sale.command';
import { PaxVoidCommand } from '@modules/finance/pos/physical/application/commands/pax-void/pax-void.command';
import { PaxRefundCommand } from '@modules/finance/pos/physical/application/commands/pax-refund/pax-refund.command';
import { PaxBatchCloseCommand } from '@modules/finance/pos/physical/application/commands/pax-batch-close/pax-batch-close.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Controller('pos/pax')
@UseGuards(AuthGuard)
export class PaxController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post('sale')
  sale(@Body() body: PaxSaleDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new PaxSaleCommand(body, ctx));
  }

  @Post('void')
  void(@Body() body: PaxVoidDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new PaxVoidCommand(body, ctx));
  }

  @Post('refund')
  refund(@Body() body: PaxRefundDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new PaxRefundCommand(body, ctx));
  }

  @Post('devices/:deviceId/batch-close')
  batchClose(
    @Param('deviceId') posDeviceId: string,
    @Body() body: PaxBatchCloseDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new PaxBatchCloseCommand({ ...body, posDeviceId }, ctx)
    );
  }
}
