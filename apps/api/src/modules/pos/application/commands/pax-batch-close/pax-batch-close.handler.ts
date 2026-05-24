import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { PaxBatchCloseCommand } from './pax-batch-close.command';
import type { PaxBatchCloseResponse } from './pax-batch-close.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/pos/domain/repositories/pos-device.repository';
import { PaxService } from '@modules/pos/infrastructure/providers/pax/pax.service';

@CommandHandler(PaxBatchCloseCommand)
export class PaxBatchCloseHandler
  implements ICommandHandler<PaxBatchCloseCommand, PaxBatchCloseResponse>
{
  private readonly logger = new Logger(PaxBatchCloseHandler.name);

  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    private readonly paxService: PaxService
  ) {}

  async execute(command: PaxBatchCloseCommand): Promise<PaxBatchCloseResponse> {
    const { input } = command;

    const device = await this.posDeviceQueryRepo.findById(input.posDeviceId);
    if (!device || !device.isActive) {
      throw new NotFoundException('POS cihazı bulunamadı veya aktif değil.');
    }

    const result = await this.paxService.batchClose({
      device: {
        host: device.host,
        port: device.port,
        terminalId: device.terminalId,
        merchantId: device.merchantId,
      },
    });

    this.logger.log(
      `PAX batch close: deviceId=${input.posDeviceId} success=${result.success} code=${result.responseCode}`
    );

    return result;
  }
}
