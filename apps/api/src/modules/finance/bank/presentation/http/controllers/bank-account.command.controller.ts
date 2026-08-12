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
import { CreateBankAccountDto } from '@shared/modules/bank/dto/commands';
import { CreateBankAccountCommand } from '@modules/finance/bank/application/commands/create-bank-account/create-bank-account.command';
import { ArchiveBankAccountCommand } from '@modules/finance/bank/application/commands/archive-bank-account/archive-bank-account.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { BANKACCOUNT } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('accounts')
export class BankAccountCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(BANKACCOUNT.create)
  @Post()
  create(@Body() dto: CreateBankAccountDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateBankAccountCommand(dto, ctx));
  }

  @HasCapability(BANKACCOUNT.delete)
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
