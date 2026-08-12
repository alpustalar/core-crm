import { QueryResponse } from '@shared/common/response/response.interface';
import { TreatmentPricing } from '@modules/clinical/treatment/domain/contracts/treatment.contracts';

export type GetTreatmentPricingResponse = QueryResponse<TreatmentPricing | null>;
