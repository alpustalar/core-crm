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
  CloseCashSessionDto,
  OpenCashSessionDto,
  RecordCashMovementDto,
} from '@shared/modules/cash-register/dto/commands';
import { OpenCashSessionCommand } from '@modules/finance/cash-register/application/commands/open-cash-session/open-cash-session.command';
import { CloseCashSessionCommand } from '@modules/finance/cash-register/application/commands/close-cash-session/close-cash-session.command';
import { RecordCashMovementCommand } from '@modules/finance/cash-register/application/commands/record-cash-movement/record-cash-movement.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CASHMOVEMENT, CASHSESSION } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('sessions')
export class CashSessionCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(CASHSESSION.create)
  @Post()
  open(@Body() dto: OpenCashSessionDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new OpenCashSessionCommand(dto, ctx));
  }

  @HasCapability(CASHMOVEMENT.create)
  @Post(':sessionId/movements')
  recordMovement(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: RecordCashMovementDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RecordCashMovementCommand({ sessionId, data: dto, ctx })
    );
  }

  @HasCapability(CASHSESSION.update)
  @Put(':sessionId/close')
  close(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: CloseCashSessionDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new CloseCashSessionCommand({ sessionId, data: dto, ctx })
    );
  }
}
