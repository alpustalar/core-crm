import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ReconcilePosTransactionsCommand } from './reconcile-pos-transactions.command';
import {
  IPosTransactionCommandRepository,
  IPosTransactionQueryRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
  POS_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PaxService } from '@modules/finance/pos/physical/infrastructure/providers/pax/pax.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';

const GRACE_PERIOD_MS = 3 * 60 * 1000; // 3 dk — in-flight işlemleri atla
const STALE_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 saat — TIMEOUT olarak işaretle

@CommandHandler(ReconcilePosTransactionsCommand)
export class ReconcilePosTransactionsHandler implements ICommandHandler<
  ReconcilePosTransactionsCommand,
  void
> {
  private readonly logger = new Logger(ReconcilePosTransactionsHandler.name);

  constructor(
    @Inject(POS_TRANSACTION_QUERY_REPOSITORY)
    private readonly posTransactionQueryRepo: IPosTransactionQueryRepository,

    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,

    private readonly paxService: PaxService,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService
  ) {}

  async execute(): Promise<void> {
    const pending =
      await this.posTransactionQueryRepo.findPendingForReconcile(
        GRACE_PERIOD_MS
      );

    if (pending.length === 0) return;

    this.logger.log(
      `Reconcile başladı: ${pending.length} PENDING işlem bulundu`
    );

    const now = Date.now();

    for (const tx of pending) {
      const ageMs = now - tx.initiatedAt.getTime();

      if (ageMs > STALE_THRESHOLD_MS) {
        await this.txManager.outboxRun(async () => {
          const entity = await this.posTransactionQueryRepo.findById(tx.id);
          if (entity) {
            entity.markTimeout();
            await this.posTransactionCommandRepo.save(entity);
          }
        });
        this.logger.warn(
          `POS işlem TIMEOUT: id=${tx.id} süre=${Math.round(ageMs / 60_000)}dk — manuel inceleme gerekebilir`
        );
        continue;
      }

      // PAX'a durum sorgusu dene (firmware desteklemiyorsa null döner)
      try {
        const result = await this.paxService.queryTransactionStatus({
          device: tx.device,
          ecReferenceNumber: tx.id,
        });

        if (result) {
          await this.txManager.outboxRun(async () => {
            const entity = await this.posTransactionQueryRepo.findById(tx.id);
            if (!entity) return;

            if (result.approved) {
              entity.markSuccess(result.externalRef, result.rawResponse);
              await this.posTransactionCommandRepo.save(entity);
              if (entity.paymentId) {
                await this.posPaymentSync.markPaid({
                  paymentId: entity.paymentId,
                  clinicId: entity.clinicId,
                });
              }
            } else {
              entity.markFailed(result.rawResponse);
              await this.posTransactionCommandRepo.save(entity);
              if (entity.paymentId) {
                await this.posPaymentSync.markFailed({
                  paymentId: entity.paymentId,
                  clinicId: entity.clinicId,
                });
              }
            }
          });

          this.logger.log(`POS işlem reconcile edildi: id=${tx.id}`);
        } else {
          this.logger.warn(
            `POS işlem reconcile edilemedi (cihaz yanıtsız/sorgu desteklenmiyor): id=${tx.id}`
          );
        }
      } catch (err) {
        this.logger.error(
          `POS reconcile hatası: id=${tx.id} — ${(err as Error).message}`
        );
      }
    }
  }
}
