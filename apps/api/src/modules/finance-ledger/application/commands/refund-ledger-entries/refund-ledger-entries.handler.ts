import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefundLedgerEntriesCommand } from './refund-ledger-entries.command';
import { RefundLedgerEntriesCommandResponse } from './refund-ledger-entries.response';
import { LedgerStatus } from '@prisma/client';
import {
  FINANCE_LEDGER_REPOSITORY,
  IFinanceLedgerRepository,
} from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(RefundLedgerEntriesCommand)
export class RefundLedgerEntriesHandler
  implements
    ICommandHandler<
      RefundLedgerEntriesCommand,
      RefundLedgerEntriesCommandResponse
    >
{
  constructor(
    @Inject(FINANCE_LEDGER_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerRepository
  ) {}

  async execute(
    command: RefundLedgerEntriesCommand
  ): Promise<RefundLedgerEntriesCommandResponse> {
    const { ctx, paymentId } = command;

    await this.financeLedgerRepository.updateManyStatusByPaymentId(
      paymentId,
      LedgerStatus.REFUNDED
    );
  }
}
