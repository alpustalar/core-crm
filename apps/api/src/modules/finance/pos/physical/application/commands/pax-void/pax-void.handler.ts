import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  OriginalPosTransactionNotFoundException,
  PosDeviceNotFoundException,
  PosTransactionMissingExternalRefException,
  PosTransactionNotVoidableException,
} from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { PaxVoidCommand } from './pax-void.command';
import type { PaxVoidResponse } from './pax-void.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import {
  IPosTransactionCommandRepository,
  IPosTransactionQueryRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
  POS_TRANSACTION_QUERY_REPOSITORY,
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

@CommandHandler(PaxVoidCommand)
export class PaxVoidHandler
  implements ICommandHandler<PaxVoidCommand, PaxVoidResponse>
{
  private readonly logger = new Logger(PaxVoidHandler.name);

  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_QUERY_REPOSITORY)
    private readonly posTransactionQueryRepo: IPosTransactionQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    private readonly paxService: PaxService,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService
  ) {}

  async execute(command: PaxVoidCommand): Promise<PaxVoidResponse> {
    const { input } = command;

    const originalTx = await this.posTransactionQueryRepo.findById(
      input.originalPosTransactionId
    );
    if (!originalTx) {
      throw new OriginalPosTransactionNotFoundException();
    }

    originalTx.validate.status
      .isSuccess(new PosTransactionNotVoidableException())
      .orThrow();

    const originalTransactionExternalRef = originalTx.validate.has
      .externalRef(new PosTransactionMissingExternalRefException())
      .orThrow();

    const device = await this.posDeviceQueryRepo.findById(
      originalTx.posDeviceId
    );
    if (!device) {
      throw new PosDeviceNotFoundException();
    }

    device.validate.status.isActive().orThrow();

    const posTransaction = PosTransaction.create({
      posDeviceId: device.id.value,
      clinicId: input.clinicId,
      paymentId: originalTx.paymentId ?? undefined,
      amount: Number(originalTx.amount),
      currency: originalTx.amount.currency,
    });

    // Faz 1 — PENDING void kaydı atomik olarak oluşturulur (TCP öncesi)
    const { voidTransactionId, voidTx } = await this.txManager.outboxRun(
      async () => {
        const id = crypto.randomUUID();
        const tx = await this.posTransactionCommandRepo.create(posTransaction);
        return { voidTransactionId: id, voidTx: tx };
      }
    );

    // Faz 2 — PAX TCP çağrısı (transaction dışında)
    try {
      const result = await this.paxService.void({
        device: device.getPaxConnection(),
        amountInMinorUnits: Math.round(Number(originalTx.amount) * 100),
        ecReferenceNumber: voidTransactionId,
        originalReferenceNumber: originalTransactionExternalRef,
      });

      // Faz 3 — sonuç + orijinal ödemeyi iade işaretle + ledger atomik (outboxRun)
      await this.txManager.outboxRun(async () => {
        if (result.approved) {
          voidTx.markSuccess(result.externalRef, result.rawResponse);
          await this.posTransactionCommandRepo.save(voidTx);
          if (originalTx.paymentId) {
            await this.posPaymentSync.markRefunded({
              paymentId: originalTx.paymentId,
              clinicId: input.clinicId,
            });
          }
        } else {
          voidTx.markFailed(result.rawResponse);
          await this.posTransactionCommandRepo.save(voidTx);
        }
      });

      const status = result.approved
        ? PosTransactionStatusSchema.enum.SUCCESS
        : PosTransactionStatusSchema.enum.FAILED;

      this.logger.log(
        `PAX void tamamlandı: id=${voidTransactionId} status=${status}`
      );

      return {
        posTransactionId: voidTransactionId,
        status,
        approved: result.approved,
        responseText: result.responseText,
        externalRef: result.externalRef,
      };
    } catch (err) {
      if (err instanceof PaxTimeoutError) {
        this.logger.warn(
          `PAX void timeout: id=${voidTransactionId} — PENDING kalıyor`
        );
        return { posTransactionId: voidTransactionId, status: 'PENDING' };
      }

      if (err instanceof PaxConnectionError) {
        await this.txManager.run(async () => {
          voidTx.markFailed();
          await this.posTransactionCommandRepo.save(voidTx);
        });
        this.logger.error(`PAX void bağlantı hatası: id=${voidTransactionId}`);
        return { posTransactionId: voidTransactionId, status: 'FAILED' };
      }

      throw err;
    }
  }
}
