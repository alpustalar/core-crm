import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  OriginalPosTransactionNotFoundException,
  PosDeviceNotFoundException,
  PosTransactionMissingExternalRefException,
  PosTransactionMissingPaymentDateException,
  PosTransactionNotVoidableException,
} from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { IyzicoTerminalVoidCommand } from './iyzico-terminal-void.command';
import type { IyzicoTerminalVoidResponse } from './iyzico-terminal-void.response';
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
import { ResolveIyzicoTerminalCredentialsService } from '@modules/finance/pos/physical/application/services/resolve-iyzico-terminal-credentials.service';
import { IyzicoTerminalService } from '@src/infrastructure/payment/pos/physical/providers/iyzico-terminal/iyzico-terminal.service';
import {
  IyzicoTerminalAuthError,
  IyzicoTerminalOperationError,
  IYZICO_TERMINAL_RETRYABLE_GROUPS,
} from '@src/infrastructure/payment/pos/physical/providers/iyzico-terminal/iyzico-terminal.errors';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';
import PosTransactionStatusSchema from '@input-type-schemas/PosTransactionStatusSchema';

@CommandHandler(IyzicoTerminalVoidCommand)
export class IyzicoTerminalVoidHandler implements ICommandHandler<
  IyzicoTerminalVoidCommand,
  IyzicoTerminalVoidResponse
> {
  private readonly logger = new Logger(IyzicoTerminalVoidHandler.name);

  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_QUERY_REPOSITORY)
    private readonly posTransactionQueryRepo: IPosTransactionQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    private readonly credentialsResolver: ResolveIyzicoTerminalCredentialsService,
    private readonly iyzicoTerminalService: IyzicoTerminalService,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService
  ) {}

  async execute(
    command: IyzicoTerminalVoidCommand
  ): Promise<IyzicoTerminalVoidResponse> {
    const { input } = command;

    const originalTx = await this.posTransactionQueryRepo.findById(
      input.originalPosTransactionId
    );
    if (!originalTx) {
      throw new OriginalPosTransactionNotFoundException();
    }
    if (originalTx.status !== PosTransactionStatusSchema.enum.SUCCESS) {
      throw new PosTransactionNotVoidableException();
    }
    if (!originalTx.externalRef) {
      throw new PosTransactionMissingExternalRefException();
    }

    const paymentDate = extractIyzicoPaymentDate(originalTx.rawResponse);
    if (!paymentDate) {
      throw new PosTransactionMissingPaymentDateException();
    }

    const device = await this.posDeviceQueryRepo.findById(
      originalTx.posDeviceId
    );
    if (!device || !device.isActive) {
      throw new PosDeviceNotFoundException();
    }

    const deviceUniqueId = device.getIyzicoDeviceUniqueId();
    const credentials = await this.credentialsResolver.resolve(input.clinicId);

    // Faz 1 — PENDING iptal kaydı atomik olarak oluşturulur (HTTP öncesi)
    const { voidTransactionId, voidTx } = await this.txManager.outboxRun(
      async () => {
        const id = crypto.randomUUID();
        const tx = await this.posTransactionCommandRepo.create({
          id,
          posDeviceId: device.id,
          clinicId: input.clinicId,
          paymentId: originalTx.paymentId ?? undefined,
          amount: Number(originalTx.amount.amount),
          currency: originalTx.amount.currency,
        });
        return { voidTransactionId: id, voidTx: tx };
      }
    );

    // Faz 2 — iyzico Terminal iptal çağrısı (transaction dışında)
    try {
      const result = await this.iyzicoTerminalService.voidPayment({
        credentials,
        deviceUniqueId,
        conversationId: voidTransactionId,
        transactionReferenceId: voidTransactionId,
        paymentId: originalTx.externalRef,
        paymentDate,
      });

      const approved = result.status === 'SUCCESS';
      const externalRef = result.cancelHostReference ?? result.paymentId;

      // Faz 3 — sonuç + orijinal ödemeyi iade/iptal işaretle atomik (outboxRun)
      await this.txManager.outboxRun(async () => {
        if (approved) {
          voidTx.markSuccess(externalRef, result);
          await this.posTransactionCommandRepo.save(voidTx);
          if (originalTx.paymentId) {
            await this.posPaymentSync.markRefunded({
              paymentId: originalTx.paymentId,
              clinicId: input.clinicId,
            });
          }
        } else {
          voidTx.markFailed(result);
          await this.posTransactionCommandRepo.save(voidTx);
        }
      });

      const status = approved
        ? PosTransactionStatusSchema.enum.SUCCESS
        : PosTransactionStatusSchema.enum.FAILED;

      this.logger.log(
        `iyzico terminal iptal tamamlandı: id=${voidTransactionId} status=${status}`
      );

      return {
        posTransactionId: voidTransactionId,
        status,
        approved,
        iyzicoPaymentId: approved ? externalRef : undefined,
        authCode: result.authCode,
        hostReference: result.hostReference,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      };
    } catch (err) {
      if (
        err instanceof IyzicoTerminalOperationError &&
        IYZICO_TERMINAL_RETRYABLE_GROUPS.has(err.group)
      ) {
        this.logger.warn(
          `iyzico terminal iptal geçici hata (${err.group}): id=${voidTransactionId} — PENDING kalıyor`
        );
        return {
          posTransactionId: voidTransactionId,
          status: PosTransactionStatusSchema.enum.PENDING,
        };
      }

      if (
        err instanceof IyzicoTerminalOperationError ||
        err instanceof IyzicoTerminalAuthError
      ) {
        await this.txManager.outboxRun(async () => {
          voidTx.markFailed();
          await this.posTransactionCommandRepo.save(voidTx);
        });
        this.logger.error(
          `iyzico terminal iptal hatası: id=${voidTransactionId} — ${err.message}`
        );
        return {
          posTransactionId: voidTransactionId,
          status: PosTransactionStatusSchema.enum.FAILED,
        };
      }

      throw err;
    }
  }
}

/** Orijinal satış işleminin ham yanıtından iyzico paymentDate'ini çıkarır. */
function extractIyzicoPaymentDate(rawResponse: unknown): string | undefined {
  const raw = rawResponse as { paymentDate?: unknown } | null;
  return typeof raw?.paymentDate === 'string' ? raw.paymentDate : undefined;
}
