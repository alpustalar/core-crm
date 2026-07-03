import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { FinancialEventUniqueConstraintException } from '@modules/finance/accounting/financial-events/domain/exceptions/financial-event-unique-constraint.exception';
import {
  FINANCIAL_EVENT_COMMAND_REPOSITORY,
  FINANCIAL_EVENT_QUERY_REPOSITORY,
  IFinancialEventCommandRepository,
  IFinancialEventQueryRepository,
} from '@modules/finance/accounting/financial-events/domain/repositories/financial-event.repository';
import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';
import { RecordFinancialEventCommand } from './record-financial-event.command';

@CommandHandler(RecordFinancialEventCommand)
export class RecordFinancialEventHandler
  implements ICommandHandler<RecordFinancialEventCommand, string>
{
  constructor(
    @Inject(FINANCIAL_EVENT_COMMAND_REPOSITORY)
    private readonly eventCommandRepo: IFinancialEventCommandRepository,
    @Inject(FINANCIAL_EVENT_QUERY_REPOSITORY)
    private readonly eventQueryRepo: IFinancialEventQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RecordFinancialEventCommand): Promise<string> {
    const { input } = command;

    if (input.dedupeKey) {
      const existing = await this.eventQueryRepo.findByDedupeKey(
        input.dedupeKey
      );
      if (existing) return existing.id.value;
    }

    const event = FinancialEvent.record(input);

    try {
      await this.txManager.run(() => this.eventCommandRepo.append(event));
      return event.id.value;
    } catch (error) {
      // Eşzamanlı kayıt aynı dedupeKey'i yazmış olabilir → mevcut olanı döndür.
      if (
        input.dedupeKey &&
        error instanceof FinancialEventUniqueConstraintException
      ) {
        const raced = await this.eventQueryRepo.findByDedupeKey(
          input.dedupeKey
        );
        if (raced) return raced.id.value;
      }
      throw error;
    }
  }
}
