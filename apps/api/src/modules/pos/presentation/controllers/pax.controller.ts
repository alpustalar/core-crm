import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '@modules/auth/guards';
import { GetContext, IGetContext } from '@common/decorators/get-context.decorator';
import { PaxSaleDto } from '@shared/modules/pos/dto/commands';
import { PaxVoidDto } from '@shared/modules/pos/dto/commands';
import { PaxRefundDto } from '@shared/modules/pos/dto/commands';
import { PaxBatchCloseDto } from '@shared/modules/pos/dto/commands';
import { PaxSaleCommand } from '@modules/pos/application/commands/pax-sale/pax-sale.command';
import { PaxVoidCommand } from '@modules/pos/application/commands/pax-void/pax-void.command';
import { PaxRefundCommand } from '@modules/pos/application/commands/pax-refund/pax-refund.command';
import { PaxBatchCloseCommand } from '@modules/pos/application/commands/pax-batch-close/pax-batch-close.command';

@Controller('pos/pax')
@UseGuards(AuthGuard)
export class PaxController {
  constructor(private readonly commandBus: CommandBus) {}

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
    @GetContext() ctx: IGetContext,
  ) {
    return this.commandBus.execute(
      new PaxBatchCloseCommand({ ...body, posDeviceId }, ctx),
    );
  }
}
