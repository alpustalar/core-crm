import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReconcileStatementLineCommand } from './reconcile-statement-line.command';
import {
  BANK_STATEMENT_LINE_COMMAND_REPOSITORY,
  IBankStatementLineCommandRepository,
} from '@modules/finance/bank/domain/repositories/bank-statement-line/bank-statement-line.repository';
import { BankStatementLineNotFoundException } from '@modules/finance/bank/domain/exceptions/bank.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(ReconcileStatementLineCommand)
export class ReconcileStatementLineHandler
  implements ICommandHandler<ReconcileStatementLineCommand, void>
{
  constructor(
    @Inject(BANK_STATEMENT_LINE_COMMAND_REPOSITORY)
    private readonly bankStatementLineRepo: IBankStatementLineCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReconcileStatementLineCommand): Promise<void> {
    const { lineId, data, ctx } = command.payload;

    // Okuma da yazma da tek transaction içinde ve KİLİTLİ: manuel mutabakat ile
    // oto-eşleştirme taraması aynı satırı hedefleyebilir; kilitsiz okumada ikisi
    // de satırı UNMATCHED görüp aynı defter hareketini iki kez bağlar.
    await this.txManager.run(async () => {
      const line = await this.bankStatementLineRepo.findByIdForUpdate(lineId);
      if (!line) {
        throw new BankStatementLineNotFoundException(lineId);
      }

      this.policyFactory
        .finance(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canAccessClinicFinances(line.clinicId.value))
        .orThrow('bank-statement-line.reconcile');

      line.reconcile({
        matchStatus: data.matchStatus,
        matchedRef: data.matchedRef,
        matchNote: data.matchNote,
        reconciledById: ctx.actor.userId,
      });

      await this.bankStatementLineRepo.update(line);
    });
  }
}
