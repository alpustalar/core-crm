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
  CloseCashSessionDto,
  OpenCashSessionDto,
  RecordCashMovementDto,
} from '@shared/modules/cash-register/dto/commands';
import { GetCashSessionsFilterDto } from '@shared/modules/cash-register/dto/queries';
import { OpenCashSessionCommand } from '@modules/finance/cash-register/application/commands/open-cash-session/open-cash-session.command';
import { CloseCashSessionCommand } from '@modules/finance/cash-register/application/commands/close-cash-session/close-cash-session.command';
import { RecordCashMovementCommand } from '@modules/finance/cash-register/application/commands/record-cash-movement/record-cash-movement.command';
import { GetCashSessionsQuery } from '@modules/finance/cash-register/application/queries/get-cash-sessions/get-cash-sessions.query';
import { GetCashSessionByIdQuery } from '@modules/finance/cash-register/application/queries/get-cash-session-by-id/get-cash-session-by-id.query';

@UseGuards(AuthGuard)
@Controller('sessions')
export class CashSessionController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  open(@Body() dto: OpenCashSessionDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new OpenCashSessionCommand(dto, ctx));
  }

  @Get()
  list(
    @Query() dto: GetCashSessionsFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetCashSessionsQuery({ filter: dto, pagination, ctx })
    );
  }

  @Get(':sessionId')
  getById(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetCashSessionByIdQuery(sessionId, ctx));
  }

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
