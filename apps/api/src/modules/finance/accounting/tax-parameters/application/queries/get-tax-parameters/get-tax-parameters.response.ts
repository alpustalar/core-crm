import { QueryResponse } from '@shared/common/response/response.interface';
import { TaxParameter } from '@modules/finance/accounting/tax-parameters/domain/entities/tax-parameter.entity';

export type GetTaxParametersResponse = QueryResponse<TaxParameter[]>;
