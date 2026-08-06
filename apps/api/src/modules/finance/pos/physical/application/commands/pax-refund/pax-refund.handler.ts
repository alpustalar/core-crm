import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  OriginalPosTransactionNotFoundException,
  PosDeviceNotFoundException,
  PosTransactionMissingExternalRefException,
  PosTransactionNotRefundableException,
  RefundAmountExceedsOriginalException,
} from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { PaxRefundCommand } from './pax-refund.command';
import type { PaxRefundResponse } from './pax-refund.response';
import {
  IPosDeviceCommandRepository,
  POS_DEVICE_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import {
  IPosTransactionCommandRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PaxService } from '@src/infrastructure/payment/pos/physical/providers/pax/pax.service';
import {
  PaxConnectionError,
  PaxTimeoutError,
} from '@src/infrastructure/payment/pos/physical/providers/pax/pax.errors';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';
import PosTransactionStatusSchema from '@input-type-schemas/PosTransactionStatusSchema';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';

@CommandHandler(PaxRefundCommand)
export class PaxRefundHandler implements ICommandHandler<
  PaxRefundCommand,
  PaxRefundResponse
> {
  private readonly logger = new Logger(PaxRefundHandler.name);

  constructor(
    @Inject(POS_DEVICE_COMMAND_REPOSITORY)
    private readonly posDeviceCommandRepo: IPosDeviceCommandRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    private readonly paxService: PaxService,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService
  ) {}

  async execute(command: PaxRefundCommand): Promise<PaxRefundResponse> {
    const { input } = command;

    const originalTx = await this.posTransactionCommandRepo.findById(
      input.originalPosTransactionId
    );
    if (!originalTx) {
      throw new OriginalPosTransactionNotFoundException();
    }
    if (originalTx.status !== PosTransactionStatusSchema.enum.SUCCESS) {
      throw new PosTransactionNotRefundableException();
    }
    if (!originalTx.externalRef) {
      throw new PosTransactionMissingExternalRefException();
    }

    const refundAmount = input.amount ?? Number(originalTx.amount);

    if (refundAmount > Number(originalTx.amount)) {
      throw new RefundAmountExceedsOriginalException();
    }

    const device = await this.posDeviceCommandRepo.findById(
      originalTx.posDeviceId
    );
    if (!device) {
      throw new PosDeviceNotFoundException();
    }

    device.validate.status.isActive.orThrow();

    const posTransaction = PosTransaction.create({
      posDeviceId: device.id.value,
      clinicId: input.clinicId,
      paymentId: originalTx.paymentId ?? undefined,
      amount: refundAmount,
      currency: originalTx.amount.currency,
    });

    // Faz 1 — PENDING iade kaydı atomik olarak oluşturulur (TCP öncesi)
    const { refundTransactionId, refundTx } = await this.txManager.outboxRun(
      async () => {
        const id = crypto.randomUUID();
        const tx = await this.posTransactionCommandRepo.create(posTransaction);
        return { refundTransactionId: id, refundTx: tx };
      }
    );

    // Faz 2 — PAX TCP çağrısı (transaction dışında)
    try {
      const result = await this.paxService.refund({
        device: device.getPaxConnection(),
        amountInMinorUnits: Math.round(refundAmount * 100),
        ecReferenceNumber: refundTransactionId,
        originalReferenceNumber: originalTx.externalRef,
      });

      // Faz 3 — sonuç + orijinal ödemeyi iade işaretle + ledger atomik (outboxRun)
      await this.txManager.outboxRun(async () => {
        if (result.approved) {
          refundTx.markSuccess(result.externalRef, result.rawResponse);
          await this.posTransactionCommandRepo.update(refundTx);
          if (originalTx.paymentId) {
            await this.posPaymentSync.markRefunded({
              paymentId: originalTx.paymentId,
              clinicId: input.clinicId,
            });
          }
        } else {
          refundTx.markFailed(result.rawResponse);
          await this.posTransactionCommandRepo.update(refundTx);
        }
      });

      const status = result.approved
        ? PosTransactionStatusSchema.enum.SUCCESS
        : PosTransactionStatusSchema.enum.FAILED;

      this.logger.log(
        `PAX iade tamamlandı: id=${refundTransactionId} status=${status}`
      );

      return {
        posTransactionId: refundTransactionId,
        status,
        approved: result.approved,
        responseText: result.responseText,
        authorizationCode: result.authorizationCode,
        externalRef: result.externalRef,
      };
    } catch (err) {
      if (err instanceof PaxTimeoutError) {
        this.logger.warn(
          `PAX iade timeout: id=${refundTransactionId} — PENDING kalıyor`
        );
        return { posTransactionId: refundTransactionId, status: 'PENDING' };
      }

      if (err instanceof PaxConnectionError) {
        await this.txManager.run(async () => {
          refundTx.markFailed();
          await this.posTransactionCommandRepo.update(refundTx);
        });
        this.logger.error(
          `PAX iade bağlantı hatası: id=${refundTransactionId}`
        );
        return { posTransactionId: refundTransactionId, status: 'FAILED' };
      }

      throw err;
    }
  }
}
