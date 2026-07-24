import { QueryResponse } from '@shared/common/response/response.interface';
import { CashSessionWithMovements } from '@modules/finance/cash-register/domain/contracts/cash-register.contracts';

export type GetCashSessionByIdResponse =
  QueryResponse<CashSessionWithMovements | null>;
