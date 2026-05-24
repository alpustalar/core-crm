import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@modules/auth/guards';
import { GetContext, IGetContext } from '@common/decorators/get-context.decorator';
import { RegisterPosDeviceCommand } from '@modules/pos/application/commands/register-pos-device/register-pos-device.command';
import { InitiatePosTransactionCommand } from '@modules/pos/application/commands/initiate-pos-transaction/initiate-pos-transaction.command';
import { FindPosDevicesQuery } from '@modules/pos/application/queries/find-pos-devices/find-pos-devices.query';

@Controller('pos/devices')
@UseGuards(AuthGuard)
export class PosDeviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get(':clinicId')
  findByClinic(
    @Param('clinicId') clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new FindPosDevicesQuery(clinicId, ctx));
  }

  @Post()
  register(@Body() body: RegisterPosDeviceCommand['input'], @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new RegisterPosDeviceCommand(body, ctx));
  }

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
