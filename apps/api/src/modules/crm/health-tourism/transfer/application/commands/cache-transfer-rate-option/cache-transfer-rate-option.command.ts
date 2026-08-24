import { TransferRateOptionToken } from '@modules/crm/health-tourism/transfer/domain/contracts/hotelbeds-transfer-booking';

/**
 * AI `search_transfers` akışının ürettiği kısa optionId → HotelBeds transfer bağlamını
 * (rateKey + yön/fiyat) cache'e yazar. `book_transfer` optionId ile geri çözer.
 * Cross-module: AI executor cache'e doğrudan değil, bu command üzerinden erişir.
 */
export class CacheTransferRateOptionCommand {
  readonly __responseType!: void;

  constructor(
    public readonly optionId: string,
    public readonly token: TransferRateOptionToken
  ) {}
}
