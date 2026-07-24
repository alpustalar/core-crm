import { IGetContext } from '@common/decorators';
import { RecordFinancialEvent } from '@shared/modules/financial-event/schemas/record-financial-event.schema';

/**
 * Ekonomik olayı kalıcı olay defterine yazar (append-only).
 * Diğer modüller (payment/invoice/pos) posting öncesi bunu CommandBus ile çağırır.
 * `dedupeKey` verilirse idempotenttir: aynı olay ikinci kez yazılmaz.
 */
export class RecordFinancialEventCommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: RecordFinancialEvent,
    public readonly ctx: IGetContext
  ) {}
}
