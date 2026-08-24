import { QueryResponse } from '@shared/common/response/response.interface';
import { CashSessionWithMovements } from '@modules/finance/cash-register/domain/contracts';

export type GetCashSessionByIdResponse =
  QueryResponse<CashSessionWithMovements | null>;
