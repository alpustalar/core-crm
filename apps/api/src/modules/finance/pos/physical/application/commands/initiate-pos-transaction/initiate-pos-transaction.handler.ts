import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { InitiatePosTransactionCommand } from './initiate-pos-transaction.command';
import { InitiatePosTransactionResponse } from './initiate-pos-transaction.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import {
  IPosTransactionCommandRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import {
  IPhysicalPosProvider,
  PHYSICAL_POS_PROVIDER,
} from '@modules/finance/pos/physical/domain/interfaces/physical-pos-provider.interface';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreatePaymentCommand } from '@modules/finance/payment/application/commands/create-payment/create-payment.command';

@CommandHandler(InitiatePosTransactionCommand)
export class InitiatePosTransactionHandler
  implements
    ICommandHandler<
      InitiatePosTransactionCommand,
      InitiatePosTransactionResponse
    >
{
  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    @Inject(PHYSICAL_POS_PROVIDER)
    private readonly posProvider: IPhysicalPosProvider,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(
    command: InitiatePosTransactionCommand
  ): Promise<InitiatePosTransactionResponse> {
    const { input } = command;

    const device = await this.posDeviceQueryRepo.findById(input.posDeviceId);
    if (!device || !device.isActive) {
      throw new NotFoundException('POS cihazı bulunamadı veya aktif değil.');
    }

    let paymentId = input.paymentId;
    if (!paymentId && input.patientId) {
      const result = await this.commandBus.execute(
        new CreatePaymentCommand({
          clinicId: input.clinicId,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          amount: input.amount,
          currency: input.currency ?? 'TRY',
        })
      );
      paymentId = result.paymentId;
    }

    const posTransactionId = crypto.randomUUID();

    await this.posTransactionCommandRepo.create({
      id: posTransactionId,
      posDeviceId: device.id,
      clinicId: input.clinicId,
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      paymentId,
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

    return {
      posTransactionId,
      externalRef: result.externalRef,
      status: 'PENDING',
    };
  }
}
