import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { PosDeviceNotFoundException } from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { PaxBatchCloseCommand } from './pax-batch-close.command';
import type { PaxBatchCloseResponse } from './pax-batch-close.response';
import { PaxService } from '@src/infrastructure/payment/pos/physical/providers/pax/pax.service';
import {
  IPosDeviceCommandRepository,
  POS_DEVICE_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device/pos-device.command.repository';

@CommandHandler(PaxBatchCloseCommand)
export class PaxBatchCloseHandler
  implements ICommandHandler<PaxBatchCloseCommand, PaxBatchCloseResponse>
{
  private readonly logger = new Logger(PaxBatchCloseHandler.name);

  constructor(
    @Inject(POS_DEVICE_COMMAND_REPOSITORY)
    private readonly posDeviceRepo: IPosDeviceCommandRepository,
    private readonly paxService: PaxService
  ) {}

  async execute(command: PaxBatchCloseCommand): Promise<PaxBatchCloseResponse> {
    const { input } = command;

    const device = await this.posDeviceRepo.findById(input.posDeviceId);
    if (!device || !device.isActive) {
      throw new PosDeviceNotFoundException();
    }

    const result = await this.paxService.batchClose({
      device: device.getPaxConnection(),
    });

    this.logger.log(
      `PAX batch close: deviceId=${input.posDeviceId} success=${result.success} code=${result.responseCode}`
    );

    return result;
  }
}
