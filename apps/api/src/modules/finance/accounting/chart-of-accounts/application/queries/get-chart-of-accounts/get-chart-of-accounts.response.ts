import { QueryResponse } from '@shared/common/response/response.interface';
import { Account } from '@shared';

export type GetChartOfAccountsResponse = QueryResponse<Account[]>;
