import { IGetContext } from '@common/decorators';

/**
 * Bir FinancialEvent'i çift taraflı yevmiye fişine çevirir ve POST eder.
 * İdempotent: olay başına en fazla bir fiş (journal_entry.event_id unique).
 * Kural yoksa veya olay bulunamazsa null döner (no-op).
 */
export class PostFinancialEventCommand {
  readonly __responseType!: string | null;
  constructor(
    public readonly financialEventId: string,
    public readonly ctx: IGetContext
  ) {}
}
