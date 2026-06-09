import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefundLedgerEntriesCommand } from './refund-ledger-entries.command';
import { RefundLedgerEntriesCommandResponse } from './refund-ledger-entries.response';
import {
  FINANCE_LEDGER_COMMAND_REPOSITORY,
  IFinanceLedgerCommandRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Inject } from '@nestjs/common';
import LedgerStatusSchema from '@input-type-schemas/LedgerStatusSchema';

@CommandHandler(RefundLedgerEntriesCommand)
export class RefundLedgerEntriesHandler
  implements
    ICommandHandler<
      RefundLedgerEntriesCommand,
      RefundLedgerEntriesCommandResponse
    >
{
  constructor(
    @Inject(FINANCE_LEDGER_COMMAND_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerCommandRepository
  ) {}

  async execute(
    command: RefundLedgerEntriesCommand
  ): Promise<RefundLedgerEntriesCommandResponse> {
    const { ctx, paymentId } = command;

    await this.financeLedgerRepository.updateManyStatusByPaymentId(
      paymentId,
      LedgerStatusSchema.enum.REFUNDED
    );
  }
}
