import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLedgerEntyCommand } from './create-ledger-enty.command';
import { CreateLedgerEntyCommandResponse } from './create-ledger-enty.response';
import { Inject } from '@nestjs/common';
import { FinanceLedgerEntity } from '@modules/finance/finance-ledger/domain/entities/finance-ledger.entity';
import { Money } from '@src/domain/value-objects/money.vo';
import {
  FINANCE_LEDGER_COMMAND_REPOSITORY,
  IFinanceLedgerCommandRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger/finance-ledger.command.repository';

@CommandHandler(CreateLedgerEntyCommand)
export class CreateLedgerEntyHandler
  implements
    ICommandHandler<CreateLedgerEntyCommand, CreateLedgerEntyCommandResponse>
{
  constructor(
    @Inject(FINANCE_LEDGER_COMMAND_REPOSITORY)
    private readonly financeLedgerRepo: IFinanceLedgerCommandRepository
  ) {}

  async execute(
    command: CreateLedgerEntyCommand
  ): Promise<CreateLedgerEntyCommandResponse> {
    const { data } = command;

    const entry = FinanceLedgerEntity.create({
      ...data,
      money: Money.create(data.amount, data.currency).orThrow(),
    });

    await this.financeLedgerRepo.create(entry);
  }
}
