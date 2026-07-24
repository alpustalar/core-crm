import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import PosProviderSchema from '@input-type-schemas/PosProviderSchema';
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

    // DTO superRefine ile sağlayıcıya göre zorunlu alanları garanti eder; burada düz DTO,
    // entity'nin katı discriminated CreatePosDeviceProps koluna daraltılır (alanlar doğrulanmış).
    const device =
      input.provider === PosProviderSchema.enum.IYZICO_TERMINAL
        ? PosDevice.create({
            clinicId: input.clinicId,
            label: input.label,
            provider: PosProviderSchema.enum.IYZICO_TERMINAL,
            deviceUniqueId: input.deviceUniqueId!,
          })
        : PosDevice.create({
            clinicId: input.clinicId,
            label: input.label,
            provider: PosProviderSchema.enum.PAX,
            terminalId: input.terminalId!,
            merchantId: input.merchantId!,
            host: input.host!,
            port: input.port!,
          });

    const saved = await this.posDeviceCommandRepo.create(device);

    return {
      id: saved.id.value,
      clinicId: saved.clinicId.value,
      label: saved.label.value,
      terminalId: saved.terminalId,
    };
  }
}
