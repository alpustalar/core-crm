import { IQuery } from '@nestjs/cqrs';
import { GetTreatmentPricingResponse } from './get-treatment-pricing.response';

/**
 * Tedavinin liste fiyatını çözer. İşlem satırı (TreatmentCharge) açılırken
 * çağrılır; fiyat satıra kopyalanıp dondurulur.
 */
export class GetTreatmentPricingQuery implements IQuery {
  readonly __responseType!: GetTreatmentPricingResponse;

  constructor(public readonly treatmentId: string) {}
}
