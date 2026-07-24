import { IQuery } from '@nestjs/cqrs';
import { GetTransferRateOptionResponse } from './get-transfer-rate-option.response';

/**
 * Kısa optionId → HotelBeds transfer bağlamını cache'ten çözer (`book_transfer` için).
 * Süresi dolmuşsa data=null döner. Cross-module: AI executor bus üzerinden erişir.
 */
export class GetTransferRateOptionQuery implements IQuery {
  readonly __responseType!: GetTransferRateOptionResponse;

  constructor(public readonly optionId: string) {}
}
