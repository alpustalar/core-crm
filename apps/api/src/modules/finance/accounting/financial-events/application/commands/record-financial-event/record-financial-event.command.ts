import { IGetContext } from '@common/decorators';
import { RecordFinancialEventProps } from '@modules/finance/accounting/financial-events/domain/financial-events.contracts';

/**
 * Ekonomik olayı kalıcı olay defterine yazar (append-only).
 * Diğer modüller (payment/invoice/pos) posting öncesi bunu CommandBus ile çağırır.
 * `dedupeKey` verilirse idempotenttir: aynı olay ikinci kez yazılmaz.
 */
export class RecordFinancialEventCommand {
  readonly __responseType!: string;
  constructor(
    public readonly input: RecordFinancialEventProps,
    public readonly ctx: IGetContext
  ) {}
}
