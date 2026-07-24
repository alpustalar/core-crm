import { HotelRateOptionToken } from '@modules/crm/health-tourism/hotel/domain/contracts/hotel.contracts';

/**
 * AI `search_hotels` akışının ürettiği kısa optionId → HotelBeds rate bağlamını
 * (rateKey + fiyat/tarih) cache'e yazar. `book_hotel` optionId ile geri çözer.
 * Cross-module: AI executor cache'e doğrudan değil, bu command üzerinden erişir.
 */
export class CacheHotelRateOptionCommand {
  readonly __responseType!: void;

  constructor(
    public readonly optionId: string,
    public readonly token: HotelRateOptionToken
  ) {}
}
