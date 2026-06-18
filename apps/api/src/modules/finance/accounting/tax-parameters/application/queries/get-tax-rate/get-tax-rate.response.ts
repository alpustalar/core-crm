import { QueryResponse } from '@shared/common/response/response.interface';
import { TaxParameterKeyType } from '@input-type-schemas/TaxParameterKeySchema';

export interface TaxRateResult {
  key: TaxParameterKeyType;
  /** Yüzde oran (ör. 10, 20). */
  rate: number;
}

export type GetTaxRateResponse = QueryResponse<TaxRateResult>;
