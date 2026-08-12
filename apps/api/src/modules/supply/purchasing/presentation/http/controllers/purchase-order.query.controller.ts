import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import { GetPurchaseOrdersFilterDto } from '@shared/modules/purchasing/dto/queries';
import { GetPurchaseOrdersQuery } from '@modules/supply/purchasing/application/queries/get-purchase-orders/get-purchase-orders.query';
import { GetPurchaseOrderByIdQuery } from '@modules/supply/purchasing/application/queries/get-purchase-order-by-id/get-purchase-order-by-id.query';
import { Serialize } from '@common/decorators/serialize.decorator';
import { PurchaseOrderResponseDto } from '@modules/supply/purchasing/presentation/http/dto/purchasing-response.dto';
import type { PurchaseOrderWithItems } from '@modules/supply/purchasing/domain/contracts/purchasing.contracts';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PURCHASEORDER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(PURCHASEORDER.read)
@Controller('orders')
export class PurchaseOrderQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}
  @Get()
  @Serialize<PurchaseOrderWithItems, PurchaseOrderResponseDto>(
    PurchaseOrderResponseDto
  )
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
  @Serialize<PurchaseOrderWithItems, PurchaseOrderResponseDto>(
    PurchaseOrderResponseDto
  )
  getById(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetPurchaseOrderByIdQuery(orderId, ctx));
  }
}
