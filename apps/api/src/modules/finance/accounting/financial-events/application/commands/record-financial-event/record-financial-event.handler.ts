import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { FinancialEventUniqueConstraintException } from '@modules/finance/accounting/financial-events/domain/exceptions/financial-event-unique-constraint.exception';
import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';
import { RecordFinancialEventCommand } from './record-financial-event.command';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { RecordFinancialEventProps } from '@modules/finance/accounting/financial-events/domain/contracts/financial-events.contracts';
import {
  FINANCIAL_EVENT_COMMAND_REPOSITORY,
  IFinancialEventCommandRepository,
} from '@modules/finance/accounting/financial-events/domain/repositories/financial-event/financial-event.command.repository';

@CommandHandler(RecordFinancialEventCommand)
export class RecordFinancialEventHandler
  implements ICommandHandler<RecordFinancialEventCommand, string>
{
  constructor(
    @Inject(FINANCIAL_EVENT_COMMAND_REPOSITORY)
    private readonly financialEventRepo: IFinancialEventCommandRepository,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RecordFinancialEventCommand): Promise<string> {
    const { data } = command;

    if (data.dedupeKey) {
      const existing = await this.financialEventRepo.findByDedupeKey(
        data.dedupeKey
      );
      if (existing) return existing.id.value;
    }

    const organizationId = await this.tenantScopeResolver.resolve(data);

    const recordData: RecordFinancialEventProps = {
      ...data,
      organizationId,
    };

    const event = FinancialEvent.record(recordData);

    try {
      await this.txManager.run(() => this.financialEventRepo.append(event));
      return event.id.value;
    } catch (error) {
      // Eşzamanlı kayıt aynı dedupeKey'i yazmış olabilir → mevcut olanı döndür.
      if (
        data.dedupeKey &&
        error instanceof FinancialEventUniqueConstraintException
      ) {
        const raced = await this.financialEventRepo.findByDedupeKey(
          data.dedupeKey
        );
        if (raced) return raced.id.value;
      }
      throw error;
    }
  }
}
