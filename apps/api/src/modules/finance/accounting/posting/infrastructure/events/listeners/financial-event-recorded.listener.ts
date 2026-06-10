import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FINANCIAL_EVENT_EVENTS } from '@src/domain/constants/events';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { FinancialEventRecordedEvent } from '@modules/finance/accounting/financial-events/domain/events/financial-event-recorded.event';
import { PostFinancialEventCommand } from '@modules/finance/accounting/posting/application/commands/post-financial-event/post-financial-event.command';

/**
 * Bir ekonomik olay kaydedildiğinde fişi üretir.
 * Asenkron ve gevşek bağlı: olay defteri bozulmaz, posting hatası kaydı etkilemez.
 */
@Injectable()
export class FinancialEventRecordedListener {
  private readonly logger = new Logger(FinancialEventRecordedListener.name);

  constructor(private readonly commandBus: TSCommandBus) {}

  @OnEvent(FINANCIAL_EVENT_EVENTS.RECORDED, { async: true })
  async handle(event: FinancialEventRecordedEvent): Promise<void> {
    const ctx = ExecutionContextFactory.createInternal();

    try {
      const entryId = await this.commandBus.execute(
        new PostFinancialEventCommand(event.financialEventId, ctx)
      );
      if (entryId) {
        this.logger.log(
          `Fiş üretildi: event=${event.financialEventId} entry=${entryId}`
        );
      }
    } catch (error) {
      this.logger.error(
        `Fiş üretilemedi: event=${event.financialEventId}`,
        error
      );
    }
  }
}
