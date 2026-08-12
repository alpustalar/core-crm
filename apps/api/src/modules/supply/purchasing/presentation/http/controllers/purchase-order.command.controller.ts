import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  CreatePurchaseOrderDto,
  ReceivePurchaseOrderDto,
} from '@shared/modules/purchasing/dto/commands';
import { CreatePurchaseOrderCommand } from '@modules/supply/purchasing/application/commands/create-purchase-order/create-purchase-order.command';
import { SendPurchaseOrderCommand } from '@modules/supply/purchasing/application/commands/send-purchase-order/send-purchase-order.command';
import { ReceivePurchaseOrderCommand } from '@modules/supply/purchasing/application/commands/receive-purchase-order/receive-purchase-order.command';
import { CancelPurchaseOrderCommand } from '@modules/supply/purchasing/application/commands/cancel-purchase-order/cancel-purchase-order.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PURCHASEORDER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('orders')
export class PurchaseOrderCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(PURCHASEORDER.create)
  @Post()
  create(@Body() dto: CreatePurchaseOrderDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreatePurchaseOrderCommand(dto, ctx));
  }

  @HasCapability(PURCHASEORDER.update)
  @Put(':orderId/send')
  send(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new SendPurchaseOrderCommand(orderId, ctx));
  }

  @HasCapability(PURCHASEORDER.update)
  @Put(':orderId/receive')
  receive(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: ReceivePurchaseOrderDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ReceivePurchaseOrderCommand({ orderId, data: dto, ctx })
    );
  }

  @HasCapability(PURCHASEORDER.update)
  @Put(':orderId/cancel')
  cancel(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CancelPurchaseOrderCommand(orderId, ctx)
    );
  }
}
