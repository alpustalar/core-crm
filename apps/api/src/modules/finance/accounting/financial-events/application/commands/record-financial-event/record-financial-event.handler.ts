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
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicOrganizationIdQuery } from '@modules/organization/clinic/application/queries/get-clinic-organization-id/get-clinic-organization-id.query';
import { RecordFinancialEventProps } from '@modules/finance/accounting/financial-events/domain/financial-events.contracts';

@CommandHandler(RecordFinancialEventCommand)
export class RecordFinancialEventHandler
  implements ICommandHandler<RecordFinancialEventCommand, string>
{
  constructor(
    @Inject(FINANCIAL_EVENT_COMMAND_REPOSITORY)
    private readonly eventCommandRepo: IFinancialEventCommandRepository,
    @Inject(FINANCIAL_EVENT_QUERY_REPOSITORY)
    private readonly eventQueryRepo: IFinancialEventQueryRepository,
    private readonly txManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: RecordFinancialEventCommand): Promise<string> {
    const { data } = command;

    if (data.dedupeKey) {
      const existing = await this.eventQueryRepo.findByDedupeKey(
        data.dedupeKey
      );
      if (existing) return existing.id.value;
    }

    const { data: organizationId } = await this.queryBus.execute(
      new GetClinicOrganizationIdQuery(data.clinicId)
    );

    const recordData: RecordFinancialEventProps = {
      ...data,
      organizationId,
    };

    const event = FinancialEvent.record(recordData);

    try {
      await this.txManager.run(() => this.eventCommandRepo.append(event));
      return event.id.value;
    } catch (error) {
      // Eşzamanlı kayıt aynı dedupeKey'i yazmış olabilir → mevcut olanı döndür.
      if (
        data.dedupeKey &&
        error instanceof FinancialEventUniqueConstraintException
      ) {
        const raced = await this.eventQueryRepo.findByDedupeKey(data.dedupeKey);
        if (raced) return raced.id.value;
      }
      throw error;
    }
  }
}
