import { QueryResponse } from '@shared/common/response/response.interface';
import { CashRegister as ICashRegister } from '@model-schema/CashRegisterSchema';

export type GetCashRegistersResponse = QueryResponse<ICashRegister[]>;
