import { QueryResponse } from '@shared/common/response/response.interface';
import { AccountingPeriod } from '@shared';

export type FindPeriodByDateResponse = QueryResponse<AccountingPeriod | null>;
