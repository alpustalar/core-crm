import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterPosDeviceCommand } from './register-pos-device.command';
import { RegisterPosDeviceResponse } from './register-pos-device.response';
import {
  IPosDeviceCommandRepository,
  POS_DEVICE_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';

@CommandHandler(RegisterPosDeviceCommand)
export class RegisterPosDeviceHandler
  implements
    ICommandHandler<RegisterPosDeviceCommand, RegisterPosDeviceResponse>
{
  constructor(
    @Inject(POS_DEVICE_COMMAND_REPOSITORY)
    private readonly posDeviceCommandRepo: IPosDeviceCommandRepository
  ) {}

  async execute(
    command: RegisterPosDeviceCommand
  ): Promise<RegisterPosDeviceResponse> {
    const { input } = command;
    const id = crypto.randomUUID();

    const device = await this.posDeviceCommandRepo.create({
      id,
      clinicId: input.clinicId,
      label: input.label,
      terminalId: input.terminalId,
      merchantId: input.merchantId,
      host: input.host,
      port: input.port,
    });

    return {
      id: device.id,
      clinicId: device.clinicId,
      label: device.label,
      terminalId: device.terminalId,
    };
  }
}
