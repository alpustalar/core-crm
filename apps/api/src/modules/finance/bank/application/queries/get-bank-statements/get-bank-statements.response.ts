import { QueryResponse } from '@shared/common/response/response.interface';
import { BankStatement as IBankStatement } from '@model-schema/BankStatementSchema';

export type GetBankStatementsResponse = QueryResponse<IBankStatement[]>;
