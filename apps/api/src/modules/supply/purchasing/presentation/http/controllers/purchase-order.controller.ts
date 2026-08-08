import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import {
  CreatePurchaseOrderDto,
  ReceivePurchaseOrderDto,
} from '@shared/modules/purchasing/dto/commands';
import { GetPurchaseOrdersFilterDto } from '@shared/modules/purchasing/dto/queries';
import { CreatePurchaseOrderCommand } from '@modules/supply/purchasing/application/commands/create-purchase-order/create-purchase-order.command';
import { SendPurchaseOrderCommand } from '@modules/supply/purchasing/application/commands/send-purchase-order/send-purchase-order.command';
import { ReceivePurchaseOrderCommand } from '@modules/supply/purchasing/application/commands/receive-purchase-order/receive-purchase-order.command';
import { CancelPurchaseOrderCommand } from '@modules/supply/purchasing/application/commands/cancel-purchase-order/cancel-purchase-order.command';
import { GetPurchaseOrdersQuery } from '@modules/supply/purchasing/application/queries/get-purchase-orders/get-purchase-orders.query';
import { GetPurchaseOrderByIdQuery } from '@modules/supply/purchasing/application/queries/get-purchase-order-by-id/get-purchase-order-by-id.query';

@UseGuards(AuthGuard)
@Controller('orders')
export class PurchaseOrderController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreatePurchaseOrderCommand(dto, ctx));
  }

  @Get()
  list(
    @Query() dto: GetPurchaseOrdersFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetPurchaseOrdersQuery({ filter: dto, pagination, ctx })
    );
  }

  @Get(':orderId')
  getById(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetPurchaseOrderByIdQuery(orderId, ctx));
  }

  @Put(':orderId/send')
  send(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new SendPurchaseOrderCommand(orderId, ctx));
  }

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
