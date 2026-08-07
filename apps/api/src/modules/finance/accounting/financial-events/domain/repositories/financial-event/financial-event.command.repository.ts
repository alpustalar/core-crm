import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';

export const FINANCIAL_EVENT_COMMAND_REPOSITORY = Symbol(
  'IFinancialEventCommandRepository'
);

export interface IFinancialEventCommandRepository {
  /** Append-only: yalnızca yeni olay ekler, update yok. */
  append(event: FinancialEvent): Promise<FinancialEvent>;

  /**
   * Idempotency anahtarıyla mevcut olay. Yeni olay yazılıp yazılmayacağı kararını
   * beslediği için Command Context'e aittir; nihai güvence `dedupeKey` unique kısıtı
   * (yarışı kaybeden taraf P2002 alır ve bu metotla kazananın kaydını okur).
   */
  findByDedupeKey(dedupeKey: string): Promise<FinancialEvent | null>;
}
