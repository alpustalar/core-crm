import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ReconcilePosTransactionsCommand } from './reconcile-pos-transactions.command';
import {
  IPosTransactionCommandRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction/pos-transaction.command.repository';
import { PaxService } from '@src/infrastructure/payment/pos/physical/providers/pax/pax.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import { FinancialEventTypeSchema, PartyRoleSchema } from '@shared';
import { FINANCIAL_EVENT_SOURCE_MODULES } from '@modules/finance/shared/domain/constants/financial-event-source-modules.constant';
import { FinancialEventDedupeKeys } from '@modules/finance/shared/domain/constants/financial-event-dedupe-keys.constant';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CriticalFailurePublisher } from '@common/observability/critical-failure.publisher';

const GRACE_PERIOD_MS = 3 * 60 * 1000; // 3 dk — in-flight işlemleri atla
const STALE_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 saat — TIMEOUT olarak işaretle

@CommandHandler(ReconcilePosTransactionsCommand)
export class ReconcilePosTransactionsHandler
  implements ICommandHandler<ReconcilePosTransactionsCommand, void>
{
  private readonly logger = new Logger(ReconcilePosTransactionsHandler.name);

  constructor(
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,

    private readonly paxService: PaxService,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService,
    private readonly commandBus: TSCommandBus,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {}

  async execute(): Promise<void> {
    const pending =
      await this.posTransactionCommandRepo.findPendingForReconcile(
        GRACE_PERIOD_MS
      );

    if (pending.length === 0) return;

    this.logger.log(
      `Reconcile döngüsü başladı. Bulunan PENDING işlem sayısı: ${pending.length}`
    );

    const now = Date.now();

    for (const tx of pending) {
      const ageMs = now - tx.initiatedAt.getTime();

      if (ageMs > STALE_THRESHOLD_MS) {
        await this.txManager.outboxRun(async () => {
          const entity = await this.posTransactionCommandRepo.findByIdForUpdate(
            tx.id
          );
          if (entity) {
            entity.markTimeout();
            await this.posTransactionCommandRepo.update(entity);
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
            // Kilitli ve taze okuma: PAX sorgusu sürerken cihaz callback'i aynı
            // işlemi sonuçlandırmış olabilir. Kilit sayesinde entity'nin "yalnız
            // PENDING'den geçiş" invariant'ı gerçekten devreye girer — kilitsizken
            // iki akış da PENDING görüp ödemeyi iki kez işaretleyebilirdi.
            const entity =
              await this.posTransactionCommandRepo.findByIdForUpdate(tx.id);
            if (!entity) return;

            // Kilidi beklerken cihaz callback'i işlemi sonuçlandırmış olabilir.
            // Entity artık "yalnız PENDING'den geçiş"i zorluyor; burada sessizce
            // atlanır ki tarama hata fırlatmasın.
            if (!entity.validate.status.isPending().value) return;

            if (result.approved) {
              entity.markSuccess(result.externalRef, result.rawResponse);
              await this.posTransactionCommandRepo.update(entity);
              if (entity.paymentId) {
                await this.posPaymentSync.markPaid({
                  paymentId: entity.paymentId,
                  clinicId: entity.clinicId.value,
                });
              }
              // Muhasebe köprüsü: PAX senkron akışı timeout/PENDING kaldığı için
              // tahsilatın muhasebe olayını üretemedi; reconcile başarıyı bulunca
              // aynı dedupeKey ile PAYMENT_RECEIVED'ı burada üretir (108 / 120).
              if (entity.patientId) {
                await this.recordPosPaymentReceived({
                  patientId: entity.patientId.value,
                  clinicId: entity.clinicId.value,
                  amount: String(entity.amount.value),
                  posTransactionId: entity.id.value,
                });
              }
            } else {
              entity.markFailed(result.rawResponse);
              await this.posTransactionCommandRepo.update(entity);
              if (entity.paymentId) {
                await this.posPaymentSync.markFailed({
                  paymentId: entity.paymentId,
                  clinicId: entity.clinicId.value,
                });
              }
            }
          });

          this.logger.log(`POS işlem reconcile edildi: id=${tx.id}`);
        } else {
          this.logger.verbose(
            `POS cihazından durum yanıtı alınamadı veya T05 desteklenmiyor: id=${tx.id}`
          );
        }
      } catch (err) {
        this.logger.error(
          `POS reconcile işlemi sırasında beklenmeyen hata fırlatıldı: id=${tx.id}`,
          (err as Error).stack
        );
        // Tarama bir sonraki işleme geçiyor; bu işlem PENDING'de asılı kalır.
        // Kart çekilmiş olabilir — kimse bakmazsa ne tahsilat ne iade görünür.
        this.criticalFailure.publish({
          operation: 'finance.pos.reconcile',
          severity: 'CRITICAL',
          summary: 'POS işlemi mutabakatta sonuçlandırılamadı; PENDING kaldı.',
          errorMessage: err instanceof Error ? err.message : String(err),
          context: { posTransactionId: tx.id },
          clinicId: null,
          dedupeKey: `pos-reconcile-failed:${tx.id}`,
        });
      }
    }
  }

  /**
   * Reconcile ile kurtarılan kart tahsilatını muhasebe katmanına köprüler:
   * cari garanti + PAYMENT_RECEIVED olayı (POS → 108). dedupeKey pax-sale ile
   * aynıdır (`payment-received:pos:${posTransactionId}`) — senkron akış olayı
   * zaten ürettiyse idempotent biçimde yutulur. Köprü hatası reconcile'ı bozmaz.
   */
  private async recordPosPaymentReceived(
    input: RecordPosPaymentReceivedInput
  ): Promise<void> {
    const ctx = ExecutionContextFactory.createInternal();

    try {
      const { partyId } = await this.commandBus.execute(
        new EnsurePartyForPatientCommand(
          input.patientId,
          input.clinicId,
          PartyRoleSchema.enum.CUSTOMER,
          ctx
        )
      );

      await this.commandBus.execute(
        new RecordFinancialEventCommand(
          {
            clinicId: input.clinicId,
            type: FinancialEventTypeSchema.enum.PAYMENT_RECEIVED,
            payload: { method: 'POS_CARD', amount: input.amount, partyId },
            sourceModule: FINANCIAL_EVENT_SOURCE_MODULES.POS,
            sourceRefId: input.posTransactionId,
            dedupeKey: FinancialEventDedupeKeys.payment_received_pos(
              input.posTransactionId
            ),
          },
          ctx
        )
      );
    } catch (error) {
      this.logger.error(
        `Muhasebe köprüsü başarısız: posTransactionId=${input.posTransactionId}`,
        error
      );
      this.criticalFailure.publish({
        operation: 'finance.pos.accounting-bridge',
        severity: 'CRITICAL',
        summary:
          'Mutabakatta sonuçlanan POS tahsilatı için muhasebe köprüsü çalışmadı.',
        errorMessage: error instanceof Error ? error.message : String(error),
        context: {
          posTransactionId: input.posTransactionId,
          patientId: input.patientId,
          amount: input.amount,
        },
        clinicId: input.clinicId,
        dedupeKey: `pos-bridge-failed:${input.posTransactionId}`,
      });
    }
  }
}

interface RecordPosPaymentReceivedInput {
  patientId: string;
  clinicId: string;
  amount: string;
  posTransactionId: string;
}
