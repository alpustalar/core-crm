import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReconcileStatementLineCommand } from './reconcile-statement-line.command';
import {
  BANK_STATEMENT_LINE_COMMAND_REPOSITORY,
  IBankStatementLineCommandRepository,
} from '@modules/finance/bank/domain/repositories/bank-statement-line.repository';
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
    private readonly lineCommandRepo: IBankStatementLineCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReconcileStatementLineCommand): Promise<void> {
    const { lineId, data, ctx } = command.payload;

    const line = await this.lineCommandRepo.findById(lineId);
    if (!line) {
      throw new BankStatementLineNotFoundException(lineId);
    }

    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicFinances(line.clinicId.value))
      .orThrow('bank-statement-line.reconcile');

    line.reconcile({
      matchStatus: data.matchStatus,
      matchedRef: data.matchedRef,
      matchNote: data.matchNote,
      reconciledById: ctx.actor.userId,
    });

    await this.txManager.run(async () => {
      await this.lineCommandRepo.save(line);
    });
  }
}
