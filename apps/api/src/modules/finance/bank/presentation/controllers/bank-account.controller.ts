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
import { CreateBankAccountDto } from '@shared/modules/bank/dto/commands';
import { GetBankAccountsFilterDto } from '@shared/modules/bank/dto/queries';
import { CreateBankAccountCommand } from '@modules/finance/bank/application/commands/create-bank-account/create-bank-account.command';
import { ArchiveBankAccountCommand } from '@modules/finance/bank/application/commands/archive-bank-account/archive-bank-account.command';
import { GetBankAccountsQuery } from '@modules/finance/bank/application/queries/get-bank-accounts/get-bank-accounts.query';
import { GetBankAccountByIdQuery } from '@modules/finance/bank/application/queries/get-bank-account-by-id/get-bank-account-by-id.query';

@UseGuards(AuthGuard)
@Controller('accounts')
export class BankAccountController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(@Body() dto: CreateBankAccountDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateBankAccountCommand(dto, ctx));
  }

  @Get()
  list(
    @Query() dto: GetBankAccountsFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetBankAccountsQuery({ filter: dto, pagination, ctx })
    );
  }

  @Get(':accountId')
  getById(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetBankAccountByIdQuery(accountId, ctx));
  }

  @Put(':accountId/archive')
  archive(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ArchiveBankAccountCommand(accountId, ctx)
    );
  }
}
