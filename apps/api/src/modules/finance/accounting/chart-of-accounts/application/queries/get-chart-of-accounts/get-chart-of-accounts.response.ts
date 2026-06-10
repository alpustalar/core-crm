import { QueryResponse } from '@shared/common/response/response.interface';
import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';

export type GetChartOfAccountsResponse = QueryResponse<Account[]>;
