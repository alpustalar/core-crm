import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { PosTransactionStatus } from '@prisma/client';
import { ReconcilePosTransactionsCommand } from './reconcile-pos-transactions.command';
import {
  IPosTransactionCommandRepository,
  IPosTransactionQueryRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
  POS_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PaxService } from '@modules/finance/pos/physical/infrastructure/providers/pax/pax.service';

const GRACE_PERIOD_MS = 3 * 60 * 1000; // 3 dk — in-flight işlemleri atla
const STALE_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 saat — TIMEOUT olarak işaretle

@CommandHandler(ReconcilePosTransactionsCommand)
export class ReconcilePosTransactionsHandler
  implements ICommandHandler<ReconcilePosTransactionsCommand, void>
{
  private readonly logger = new Logger(ReconcilePosTransactionsHandler.name);

  constructor(
    @Inject(POS_TRANSACTION_QUERY_REPOSITORY)
    private readonly posTransactionQueryRepo: IPosTransactionQueryRepository,

    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,

    private readonly paxService: PaxService
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
        await this.posTransactionCommandRepo.updateStatus({
          id: tx.id,
          status: PosTransactionStatus.TIMEOUT,
          completedAt: new Date(),
        });
        this.logger.warn(
          `POS işlem TIMEOUT: id=${tx.id} yaş=${Math.round(ageMs / 60_000)}dk — manuel inceleme gerekebilir`
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
          const status = result.approved
            ? PosTransactionStatus.SUCCESS
            : PosTransactionStatus.FAILED;

          await this.posTransactionCommandRepo.updateStatus({
            id: tx.id,
            status,
            rawResponse: result.rawResponse,
            completedAt: new Date(),
          });

          this.logger.log(
            `POS işlem reconcile edildi: id=${tx.id} → ${status}`
          );
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
