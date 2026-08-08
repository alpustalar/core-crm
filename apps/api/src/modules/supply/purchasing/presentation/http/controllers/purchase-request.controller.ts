import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards, } from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import { CreatePurchaseRequestDto, ReviewPurchaseRequestDto, } from '@shared/modules/purchasing/dto/commands';
import { GetPurchaseRequestsFilterDto } from '@shared/modules/purchasing/dto/queries';
import {
  CreatePurchaseRequestCommand
} from '@modules/supply/purchasing/application/commands/create-purchase-request/create-purchase-request.command';
import {
  ApprovePurchaseRequestCommand
} from '@modules/supply/purchasing/application/commands/approve-purchase-request/approve-purchase-request.command';
import {
  RejectPurchaseRequestCommand
} from '@modules/supply/purchasing/application/commands/reject-purchase-request/reject-purchase-request.command';
import {
  CancelPurchaseRequestCommand
} from '@modules/supply/purchasing/application/commands/cancel-purchase-request/cancel-purchase-request.command';
import {
  GetPurchaseRequestsQuery
} from '@modules/supply/purchasing/application/queries/get-purchase-requests/get-purchase-requests.query';
import {
  GetPurchaseRequestByIdQuery
} from '@modules/supply/purchasing/application/queries/get-purchase-request-by-id/get-purchase-request-by-id.query';

@UseGuards(AuthGuard)
@Controller('requests')
export class PurchaseRequestController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(
    @Body() dto: CreatePurchaseRequestDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CreatePurchaseRequestCommand(dto, ctx));
  }

  @Get()
  list(
    @Query() dto: GetPurchaseRequestsFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetPurchaseRequestsQuery({ filter: dto, pagination, ctx })
    );
  }

  @Get(':requestId')
  getById(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetPurchaseRequestByIdQuery(requestId, ctx)
    );
  }

  @Put(':requestId/approve')
  approve(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: ReviewPurchaseRequestDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ApprovePurchaseRequestCommand({ requestId, data: dto, ctx })
    );
  }

  @Put(':requestId/reject')
  reject(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: ReviewPurchaseRequestDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RejectPurchaseRequestCommand({ requestId, data: dto, ctx })
    );
  }

  @Put(':requestId/cancel')
  cancel(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CancelPurchaseRequestCommand(requestId, ctx)
    );
  }
}
