import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterPosDeviceCommand } from './register-pos-device.command';
import { RegisterPosDeviceResponse } from './register-pos-device.response';
import {
  IPosDeviceCommandRepository,
  POS_DEVICE_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import { PosDevice } from '@modules/finance/pos/physical/domain/entities/pos-device.entity';

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

    const device = PosDevice.create({
      clinicId: input.clinicId,
      label: input.label,
      provider: input.provider,
      terminalId: input.terminalId,
      merchantId: input.merchantId,
      host: input.host,
      port: input.port,
      deviceUniqueId: input.deviceUniqueId,
    });

    if (device.isPax()) {
      device.getPaxConnection();
    } else {
      device.getIyzicoDeviceUniqueId();
    }

    const saved = await this.posDeviceCommandRepo.save(device);

    return {
      id: saved.id,
      clinicId: saved.clinicId,
      label: saved.label,
      terminalId: saved.terminalId,
    };
  }
}
