import { QueryResponse } from '@shared/common/response/response.interface';
import { BankAccount as IBankAccount } from '@model-schema/BankAccountSchema';

export type GetBankAccountByIdResponse = QueryResponse<IBankAccount | null>;
