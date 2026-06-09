import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLedgerEntyCommand } from './create-ledger-enty.command';
import { CreateLedgerEntyCommandResponse } from './create-ledger-enty.response';
import {
  FINANCE_LEDGER_COMMAND_REPOSITORY,
  IFinanceLedgerCommandRepository,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Inject } from '@nestjs/common';
import { FinanceLedgerEntity } from '@modules/finance/finance-ledger/domain/entities/finance-ledger.entity';

@CommandHandler(CreateLedgerEntyCommand)
export class CreateLedgerEntyHandler
  implements
    ICommandHandler<CreateLedgerEntyCommand, CreateLedgerEntyCommandResponse>
{
  constructor(
    @Inject(FINANCE_LEDGER_COMMAND_REPOSITORY)
    private readonly financeLedgerCommandRepo: IFinanceLedgerCommandRepository
  ) {}

  async execute(
    command: CreateLedgerEntyCommand
  ): Promise<CreateLedgerEntyCommandResponse> {
    const { dto } = command;

    const entry = FinanceLedgerEntity.create({
      ...dto,
      currency: dto.currency ?? 'TRY',
    });

    await this.financeLedgerCommandRepo.save(entry);
  }
}
