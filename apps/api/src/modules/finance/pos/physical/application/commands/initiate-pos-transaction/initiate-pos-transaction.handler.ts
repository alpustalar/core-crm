import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PosDeviceNotFoundException } from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
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
import PaymentMethodSchema from '@input-type-schemas/PaymentMethodSchema';
import PosTransactionStatusSchema from '@input-type-schemas/PosTransactionStatusSchema';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';

@CommandHandler(InitiatePosTransactionCommand)
export class InitiatePosTransactionHandler implements ICommandHandler<
  InitiatePosTransactionCommand,
  InitiatePosTransactionResponse
> {
  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    @Inject(PHYSICAL_POS_PROVIDER)
    private readonly posProvider: IPhysicalPosProvider,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: InitiatePosTransactionCommand
  ): Promise<InitiatePosTransactionResponse> {
    const { input } = command;

    const device = await this.posDeviceQueryRepo.findById(input.posDeviceId);
    if (!device || !device.isActive) {
      throw new PosDeviceNotFoundException();
    }

    // Faz 1 — ödeme kaydı + PENDING işlem atomik olarak oluşturulur (TCP öncesi)
    const { posTransactionId, transaction } = await this.txManager.outboxRun(
      async () => {
        const internalPaymentId = input.paymentId ?? crypto.randomUUID();
        let paymentId = input.paymentId;
        if (!paymentId && input.patientId) {
          await this.commandBus.execute(
            new CreatePaymentCommand(
              {
                clinicId: input.clinicId,
                patientId: input.patientId,
                appointmentId: input.appointmentId,
                amount: input.amount,
                currency: input.currency,
                method: PaymentMethodSchema.enum.CREDIT_CARD,
              },
              {
                paymentId: internalPaymentId,
              }
            )
          );
          paymentId = internalPaymentId;
        }

        // TODO: burada logic hatası olabilir tekrar kontrol etmek gerekiyor

        const id = crypto.randomUUID();
        const tx = await this.posTransactionCommandRepo.create({
          id,
          posDeviceId: device.id,
          clinicId: input.clinicId,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          paymentId,
          amount: input.amount,
          currency: input.currency ?? 'TRY',
        });
        return { posTransactionId: id, transaction: tx };
      }
    );

    // Faz 2 — sağlayıcı TCP/HTTP çağrısı (transaction dışında)
    const { terminalId, merchantId } = device.getPaxConnection();
    const result = await this.posProvider.initiate({
      posTransactionId,
      terminalId,
      merchantId,
      amount: input.amount,
      currency: input.currency ?? CurrencySchema.enum.TRY,
    });

    // Faz 3 — externalRef kaydedilir
    await this.txManager.run(async () => {
      transaction.setExternalRef(result.externalRef, result.rawRequest);
      await this.posTransactionCommandRepo.save(transaction);
    });

    return {
      posTransactionId,
      externalRef: result.externalRef,
      status: PosTransactionStatusSchema.enum.PENDING,
    };
  }
}
