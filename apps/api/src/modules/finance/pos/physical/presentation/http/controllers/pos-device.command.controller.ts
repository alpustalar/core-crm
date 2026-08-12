import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';
import { RegisterPosDeviceCommand } from '@modules/finance/pos/physical/application/commands/register-pos-device/register-pos-device.command';
import { RegisterPosDeviceDto } from '@shared/modules/pos/dto/commands';
import { InitiatePosTransactionCommand } from '@modules/finance/pos/physical/application/commands/initiate-pos-transaction/initiate-pos-transaction.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { POSDEVICE, POSTRANSACTION } = CAPABILITIES;
@Controller('devices')
@UseGuards(AuthGuard, CapabilityGuard)
export class PosDeviceCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(POSDEVICE.create)
  @Post()
  register(@Body() body: RegisterPosDeviceDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new RegisterPosDeviceCommand(body, ctx));
  }

  @HasCapability(POSTRANSACTION.create)
  @Post(':deviceId/transactions')
  initiateTransaction(
    @Param('deviceId') posDeviceId: string,
    @Body() body: Omit<InitiatePosTransactionCommand['input'], 'posDeviceId'>,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new InitiatePosTransactionCommand({ ...body, posDeviceId }, ctx)
    );
  }
}
