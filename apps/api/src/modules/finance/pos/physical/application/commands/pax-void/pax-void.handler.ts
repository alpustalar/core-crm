import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { PaxService } from '@modules/finance/pos/physical/infrastructure/providers/pax/pax.service';
import {
  PaxConnectionError,
  PaxTimeoutError,
} from '@modules/finance/pos/physical/infrastructure/providers/pax/pax.errors';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';
import { PosTransactionStatus } from '@prisma/client';

@CommandHandler(PaxVoidCommand)
export class PaxVoidHandler implements ICommandHandler<
  PaxVoidCommand,
  PaxVoidResponse
> {
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
      throw new NotFoundException('Orijinal POS işlemi bulunamadı.');
    }
    if (originalTx.status !== PosTransactionStatus.SUCCESS) {
      throw new BadRequestException(
        'Yalnızca başarılı işlemler iptal edilebilir.'
      );
    }
    if (!originalTx.externalRef) {
      throw new BadRequestException(
        'Orijinal işlemin PAX referansı (HostRefNum) bulunamadı.'
      );
    }

    const device = await this.posDeviceQueryRepo.findById(
      originalTx.posDeviceId
    );
    if (!device || !device.isActive) {
      throw new NotFoundException('POS cihazı bulunamadı veya aktif değil.');
    }

    // Faz 1 — PENDING void kaydı atomik olarak oluşturulur (TCP öncesi)
    const { voidTransactionId, voidTx } = await this.txManager.outboxRun(
      async () => {
        const id = crypto.randomUUID();
        const tx = await this.posTransactionCommandRepo.create({
          id,
          posDeviceId: device.id,
          clinicId: input.clinicId,
          paymentId: originalTx.paymentId ?? undefined,
          amount: Number(originalTx.amount),
          currency: originalTx.currency,
        });
        return { voidTransactionId: id, voidTx: tx };
      }
    );

    // Faz 2 — PAX TCP çağrısı (transaction dışında)
    try {
      const result = await this.paxService.void({
        device: {
          host: device.host,
          port: device.port,
          terminalId: device.terminalId,
          merchantId: device.merchantId,
        },
        amountInMinorUnits: Math.round(Number(originalTx.amount) * 100),
        ecReferenceNumber: voidTransactionId,
        originalReferenceNumber: originalTx.externalRef,
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
        ? PosTransactionStatus.SUCCESS
        : PosTransactionStatus.FAILED;

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
