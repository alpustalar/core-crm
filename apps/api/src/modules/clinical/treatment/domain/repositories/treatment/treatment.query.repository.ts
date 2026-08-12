import { TreatmentPricing } from '@modules/clinical/treatment/domain/contracts/treatment.contracts';

export const TREATMENT_QUERY_REPOSITORY = Symbol('ITreatmentQueryRepository');

export interface ITreatmentQueryRepository {
  /** İşlem satırı açılırken liste fiyatının okunduğu projeksiyon. */
  findPricingById(treatmentId: string): Promise<TreatmentPricing | null>;
}
