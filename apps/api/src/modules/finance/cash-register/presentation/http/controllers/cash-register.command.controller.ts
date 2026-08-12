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
import { CreateCashRegisterDto } from '@shared/modules/cash-register/dto/commands';
import { CreateCashRegisterCommand } from '@modules/finance/cash-register/application/commands/create-cash-register/create-cash-register.command';
import { ArchiveCashRegisterCommand } from '@modules/finance/cash-register/application/commands/archive-cash-register/archive-cash-register.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { CASHREGISTER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('registers')
export class CashRegisterCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(CASHREGISTER.create)
  @Post()
  create(@Body() dto: CreateCashRegisterDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateCashRegisterCommand(dto, ctx));
  }

  @HasCapability(CASHREGISTER.delete)
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
