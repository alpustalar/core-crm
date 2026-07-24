import { IQuery } from '@nestjs/cqrs';
import { GetHotelRateOptionResponse } from './get-hotel-rate-option.response';

/**
 * Kısa optionId → HotelBeds rate bağlamını cache'ten çözer (`book_hotel` için).
 * Süresi dolmuşsa data=null döner. Cross-module: AI executor bus üzerinden erişir.
 */
export class GetHotelRateOptionQuery implements IQuery {
  readonly __responseType!: GetHotelRateOptionResponse;

  constructor(public readonly optionId: string) {}
}
