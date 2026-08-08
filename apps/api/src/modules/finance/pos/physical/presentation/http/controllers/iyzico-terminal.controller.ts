import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import {
  IyzicoTerminalEodDto,
  IyzicoTerminalRefundDto,
  IyzicoTerminalSaleDto,
  IyzicoTerminalVoidDto,
  RegisterClinicIyzicoTerminalConfigDto,
} from '@shared/modules/pos/dto/commands';
import { IyzicoTerminalSaleCommand } from '@modules/finance/pos/physical/application/commands/iyzico-terminal-sale/iyzico-terminal-sale.command';
import { IyzicoTerminalVoidCommand } from '@modules/finance/pos/physical/application/commands/iyzico-terminal-void/iyzico-terminal-void.command';
import { IyzicoTerminalRefundCommand } from '@modules/finance/pos/physical/application/commands/iyzico-terminal-refund/iyzico-terminal-refund.command';
import { IyzicoTerminalEodCommand } from '@modules/finance/pos/physical/application/commands/iyzico-terminal-eod/iyzico-terminal-eod.command';
import { RegisterClinicIyzicoTerminalConfigCommand } from '@modules/finance/pos/physical/application/commands/register-clinic-iyzico-terminal-config/register-clinic-iyzico-terminal-config.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

@Controller('pos/iyzico-terminal')
@UseGuards(AuthGuard)
export class IyzicoTerminalController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post('config')
  registerConfig(
    @Body() body: RegisterClinicIyzicoTerminalConfigDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RegisterClinicIyzicoTerminalConfigCommand(body, ctx)
    );
  }

  @Post('sale')
  sale(@Body() body: IyzicoTerminalSaleDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new IyzicoTerminalSaleCommand(body, ctx));
  }

  @Post('void')
  void(@Body() body: IyzicoTerminalVoidDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new IyzicoTerminalVoidCommand(body, ctx));
  }

  @Post('refund')
  refund(
    @Body() body: IyzicoTerminalRefundDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new IyzicoTerminalRefundCommand(body, ctx));
  }

  @Post('devices/:deviceId/eod')
  eod(
    @Param('deviceId') posDeviceId: string,
    @Body() body: IyzicoTerminalEodDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new IyzicoTerminalEodCommand({ ...body, posDeviceId }, ctx)
    );
  }
}
