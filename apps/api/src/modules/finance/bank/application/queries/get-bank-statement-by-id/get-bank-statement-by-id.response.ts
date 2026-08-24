import { QueryResponse } from '@shared/common/response/response.interface';
import { BankStatementWithLines } from '@modules/finance/bank/domain/contracts';

export type GetBankStatementByIdResponse =
  QueryResponse<BankStatementWithLines | null>;
