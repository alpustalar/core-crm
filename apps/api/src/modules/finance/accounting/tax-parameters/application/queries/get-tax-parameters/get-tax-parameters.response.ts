import { QueryResponse } from '@shared/common/response/response.interface';
import { TaxParameter } from '@shared';

export type GetTaxParametersResponse = QueryResponse<TaxParameter[]>;
