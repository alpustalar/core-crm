import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  CancelWorkOrderDto,
  CreateExternalWorkOrderDto,
  FitWorkOrderDto,
  OpenRemakeWorkOrderDto,
  ReceiveWorkOrderDto,
  SendWorkOrderDto,
  UpdateWorkOrderProgressDto,
} from '@shared/modules/work-order/dto/commands';
import { CreateExternalWorkOrderCommand } from '@modules/supply/work-order/application/commands/create-external-work-order/create-external-work-order.command';
import { SendWorkOrderCommand } from '@modules/supply/work-order/application/commands/send-work-order/send-work-order.command';
import { UpdateWorkOrderProgressCommand } from '@modules/supply/work-order/application/commands/update-work-order-progress/update-work-order-progress.command';
import { ReceiveWorkOrderCommand } from '@modules/supply/work-order/application/commands/receive-work-order/receive-work-order.command';
import { FitWorkOrderCommand } from '@modules/supply/work-order/application/commands/fit-work-order/fit-work-order.command';
import { CancelWorkOrderCommand } from '@modules/supply/work-order/application/commands/cancel-work-order/cancel-work-order.command';
import { OpenRemakeWorkOrderCommand } from '@modules/supply/work-order/application/commands/open-remake-work-order/open-remake-work-order.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { EXTERNALWORKORDER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('orders')
export class WorkOrderCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(EXTERNALWORKORDER.create)
  @Post()
  create(
    @Body() dto: CreateExternalWorkOrderDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CreateExternalWorkOrderCommand(dto, ctx)
    );
  }

  @HasCapability(EXTERNALWORKORDER.update)
  @Post(':id/send')
  send(
    @Param('id', ParseUUIDPipe) workOrderId: string,
    @Body() dto: SendWorkOrderDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SendWorkOrderCommand({ workOrderId, data: dto, ctx })
    );
  }

  @HasCapability(EXTERNALWORKORDER.update)
  @Post(':id/progress')
  updateProgress(
    @Param('id', ParseUUIDPipe) workOrderId: string,
    @Body() dto: UpdateWorkOrderProgressDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateWorkOrderProgressCommand({ workOrderId, data: dto, ctx })
    );
  }

  @HasCapability(EXTERNALWORKORDER.update)
  @Post(':id/receive')
  receive(
    @Param('id', ParseUUIDPipe) workOrderId: string,
    @Body() dto: ReceiveWorkOrderDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ReceiveWorkOrderCommand({ workOrderId, data: dto, ctx })
    );
  }

  @HasCapability(EXTERNALWORKORDER.update)
  @Post(':id/fit')
  fit(
    @Param('id', ParseUUIDPipe) workOrderId: string,
    @Body() dto: FitWorkOrderDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new FitWorkOrderCommand({ workOrderId, data: dto, ctx })
    );
  }

  @HasCapability(EXTERNALWORKORDER.update)
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) workOrderId: string,
    @Body() dto: CancelWorkOrderDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CancelWorkOrderCommand({ workOrderId, data: dto, ctx })
    );
  }

  @HasCapability(EXTERNALWORKORDER.create)
  @Post(':id/remake')
  openRemake(
    @Param('id', ParseUUIDPipe) workOrderId: string,
    @Body() dto: OpenRemakeWorkOrderDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new OpenRemakeWorkOrderCommand({ workOrderId, data: dto, ctx })
    );
  }
}
