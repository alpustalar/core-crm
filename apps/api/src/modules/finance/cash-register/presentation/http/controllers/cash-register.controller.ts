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
import { CreateCashRegisterDto } from '@shared/modules/cash-register/dto/commands';
import { GetCashRegistersFilterDto } from '@shared/modules/cash-register/dto/queries';
import { CreateCashRegisterCommand } from '@modules/finance/cash-register/application/commands/create-cash-register/create-cash-register.command';
import { ArchiveCashRegisterCommand } from '@modules/finance/cash-register/application/commands/archive-cash-register/archive-cash-register.command';
import { GetCashRegistersQuery } from '@modules/finance/cash-register/application/queries/get-cash-registers/get-cash-registers.query';
import { GetCashRegisterByIdQuery } from '@modules/finance/cash-register/application/queries/get-cash-register-by-id/get-cash-register-by-id.query';
import { GetOpenCashSessionQuery } from '@modules/finance/cash-register/application/queries/get-open-cash-session/get-open-cash-session.query';

@UseGuards(AuthGuard)
@Controller('registers')
export class CashRegisterController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(@Body() dto: CreateCashRegisterDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateCashRegisterCommand(dto, ctx));
  }

  @Get()
  list(
    @Query() dto: GetCashRegistersFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetCashRegistersQuery({ filter: dto, pagination, ctx })
    );
  }

  @Get(':registerId')
  getById(
    @Param('registerId', ParseUUIDPipe) registerId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetCashRegisterByIdQuery(registerId, ctx));
  }

  @Get(':registerId/open-session')
  getOpenSession(
    @Param('registerId', ParseUUIDPipe) registerId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetOpenCashSessionQuery(registerId, ctx));
  }

  @Put(':registerId/archive')
  archive(
    @Param('registerId', ParseUUIDPipe) registerId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ArchiveCashRegisterCommand(registerId, ctx)
    );
  }
}
