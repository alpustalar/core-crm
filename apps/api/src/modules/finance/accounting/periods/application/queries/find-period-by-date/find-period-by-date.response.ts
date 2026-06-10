import { QueryResponse } from '@shared/common/response/response.interface';
import { AccountingPeriod } from '@modules/finance/accounting/periods/domain/entities/accounting-period.entity';

export type FindPeriodByDateResponse = QueryResponse<AccountingPeriod | null>;
