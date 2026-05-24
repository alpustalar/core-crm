import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { InitiatePosTransactionCommand } from './initiate-pos-transaction.command';
import { InitiatePosTransactionResponse } from './initiate-pos-transaction.response';
import {
  POS_DEVICE_QUERY_REPOSITORY,
  IPosDeviceQueryRepository,
} from '@modules/pos/domain/repositories/pos-device.repository';
import {
  POS_TRANSACTION_COMMAND_REPOSITORY,
  IPosTransactionCommandRepository,
} from '@modules/pos/domain/repositories/pos-transaction.repository';
import {
  PHYSICAL_POS_PROVIDER,
  IPhysicalPosProvider,
} from '@modules/pos/domain/interfaces/physical-pos-provider.interface';

@CommandHandler(InitiatePosTransactionCommand)
export class InitiatePosTransactionHandler
  implements ICommandHandler<InitiatePosTransactionCommand, InitiatePosTransactionResponse>
{
  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    @Inject(PHYSICAL_POS_PROVIDER)
    private readonly posProvider: IPhysicalPosProvider
  ) {}

  async execute(command: InitiatePosTransactionCommand): Promise<InitiatePosTransactionResponse> {
    const { input } = command;

    const device = await this.posDeviceQueryRepo.findById(input.posDeviceId);
    if (!device || !device.isActive) {
      throw new NotFoundException('POS cihazı bulunamadı veya aktif değil.');
    }

    const posTransactionId = crypto.randomUUID();

    await this.posTransactionCommandRepo.create({
      id: posTransactionId,
      posDeviceId: device.id,
      clinicId: input.clinicId,
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      paymentId: input.paymentId,
      amount: input.amount,
      currency: input.currency ?? 'TRY',
    });

    const result = await this.posProvider.initiate({
      posTransactionId,
      terminalId: device.terminalId,
      merchantId: device.merchantId,
      amount: input.amount,
      currency: input.currency ?? 'TRY',
    });

    await this.posTransactionCommandRepo.setExternalRef({
      id: posTransactionId,
      externalRef: result.externalRef,
      rawRequest: result.rawRequest,
    });

    return { posTransactionId, externalRef: result.externalRef, status: 'PENDING' };
  }
}
