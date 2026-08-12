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
  CreatePurchaseRequestDto,
  ReviewPurchaseRequestDto,
} from '@shared/modules/purchasing/dto/commands';
import { CreatePurchaseRequestCommand } from '@modules/supply/purchasing/application/commands/create-purchase-request/create-purchase-request.command';
import { ApprovePurchaseRequestCommand } from '@modules/supply/purchasing/application/commands/approve-purchase-request/approve-purchase-request.command';
import { RejectPurchaseRequestCommand } from '@modules/supply/purchasing/application/commands/reject-purchase-request/reject-purchase-request.command';
import { CancelPurchaseRequestCommand } from '@modules/supply/purchasing/application/commands/cancel-purchase-request/cancel-purchase-request.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PURCHASEREQUEST } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('requests')
export class PurchaseRequestCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(PURCHASEREQUEST.create)
  @Post()
  create(
    @Body() dto: CreatePurchaseRequestDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CreatePurchaseRequestCommand(dto, ctx));
  }

  @HasCapability(PURCHASEREQUEST.update)
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

  @HasCapability(PURCHASEREQUEST.update)
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

  @HasCapability(PURCHASEREQUEST.update)
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
