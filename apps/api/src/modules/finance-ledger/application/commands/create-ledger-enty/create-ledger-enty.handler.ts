import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLedgerEntyCommand } from './create-ledger-enty.command';
import { CreateLedgerEntyCommandResponse } from './create-ledger-enty.response';
import {
  FINANCE_LEDGER_REPOSITORY,
  IFinanceLedgerRepository,
} from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateLedgerEntyCommand)
export class CreateLedgerEntyHandler
  implements
    ICommandHandler<CreateLedgerEntyCommand, CreateLedgerEntyCommandResponse>
{
  constructor(
    @Inject(FINANCE_LEDGER_REPOSITORY)
    private readonly financeLedgerRepository: IFinanceLedgerRepository
  ) {}

  async execute(
    command: CreateLedgerEntyCommand
  ): Promise<CreateLedgerEntyCommandResponse> {
    const { dto, ctx } = command;

    await this.financeLedgerRepository.create({
      ...dto,
      currency: dto.currency ?? 'TRY',
    });
  }
}
